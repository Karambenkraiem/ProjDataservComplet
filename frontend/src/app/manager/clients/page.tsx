'use client';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi, usersApi, authApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import {
  Plus, X, Building2, CheckCircle2, XCircle, PowerOff, Power,
  Trash2, Eye, ShieldAlert, ChevronUp, ChevronDown, ChevronsUpDown,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

type ClientFormData = {
  name: string; companyName: string; email: string; password: string;
  phone?: string; address?: string; travelTimeMinutes?: number;
  isContractual?: boolean; contractHours?: number;
};

type SortField = 'createdAt' | 'companyName' | 'isActive' | 'tickets';
type SortDir = 'asc' | 'desc';

function SortTh({ label, field, sort, onSort }: {
  label: string; field: SortField;
  sort: { field: SortField; dir: SortDir };
  onSort: (f: SortField) => void;
}) {
  const active = sort.field === field;
  return (
    <th className="px-4 py-3 text-left">
      <button
        onClick={() => onSort(field)}
        className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wide transition-colors ${active ? 'text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}
      >
        {label}
        {active
          ? sort.dir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          : <ChevronsUpDown className="w-3 h-3 text-slate-300" />}
      </button>
    </th>
  );
}

export default function ManagerClientsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({ field: 'createdAt', dir: 'desc' });
  const [confirmToggle, setConfirmToggle] = useState<{ userId: string; isActive: boolean; name: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ userId: string; name: string } | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteAttempts, setDeleteAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;

  const { data: clients = [], isLoading } = useQuery({ queryKey: ['clients'], queryFn: clientsApi.list });

  const { register, handleSubmit, reset, watch } = useForm<ClientFormData>({ defaultValues: { isContractual: false } });
  const isContractual = watch('isContractual');

  const createMutation = useMutation({
    mutationFn: clientsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); setShowForm(false); reset(); },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      isActive ? usersApi.deactivate(userId) : usersApi.activate(userId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); setConfirmToggle(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      await authApi.verifyPassword(password);
      return usersApi.delete(userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      setConfirmDelete(null); setDeletePassword(''); setDeleteError(''); setDeleteAttempts(0);
    },
    onError: (e: any) => {
      if (e?.response?.status === 401) {
        const next = deleteAttempts + 1;
        setDeleteAttempts(next); setDeletePassword('');
        if (next >= MAX_ATTEMPTS) { localStorage.removeItem('dataserv-auth'); window.location.href = '/auth/login?disabled=1'; }
        else setDeleteError(`Mot de passe incorrect. ${MAX_ATTEMPTS - next} tentative(s) restante(s).`);
      } else {
        setDeleteError(e?.response?.data?.message || 'Erreur lors de la suppression');
      }
    },
  });

  const toggleSort = (field: SortField) => {
    setSort(s => s.field === field ? { ...s, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { field, dir: 'desc' });
  };

  const displayed = useMemo(() => {
    let list = [...clients] as any[];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.companyName?.toLowerCase().includes(q) ||
        c.user?.name?.toLowerCase().includes(q) ||
        c.user?.email?.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      let av: any, bv: any;
      if (sort.field === 'createdAt') { av = new Date(a.createdAt ?? 0).getTime(); bv = new Date(b.createdAt ?? 0).getTime(); }
      else if (sort.field === 'companyName') { av = a.companyName ?? ''; bv = b.companyName ?? ''; }
      else if (sort.field === 'isActive') { av = a.user?.isActive ? 1 : 0; bv = b.user?.isActive ? 1 : 0; }
      else if (sort.field === 'tickets') { av = a.tickets?.length ?? 0; bv = b.tickets?.length ?? 0; }
      else { av = 0; bv = 0; }
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [clients, search, sort]);

  return (
    <div className="flex flex-col h-full">
      <Header title="Clients" subtitle={`${displayed.length} client(s)`} />
      <div className="flex-1 p-6 overflow-y-auto">

        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors">
            <Plus className="w-4 h-4" /> Nouveau client
          </button>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher société, contact…"
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white w-56 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Modal création */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
                <h2 className="font-semibold text-slate-800">Nouveau client</h2>
                <button onClick={() => { setShowForm(false); reset(); }}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet *</label>
                    <input {...register('name', { required: true })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Société *</label>
                    <input {...register('companyName', { required: true })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input {...register('email', { required: true })} type="email" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe *</label>
                    <input {...register('password', { required: true, minLength: 8 })} type="password" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                    <input {...register('phone')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                  <input {...register('address')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Déplacement (min)</label>
                  <input {...register('travelTimeMinutes')} type="number" defaultValue={0} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input {...register('isContractual')} type="checkbox" className="w-4 h-4 rounded text-blue-600" />
                  <span className="text-sm text-slate-700">Client sous contrat</span>
                </label>
                {isContractual && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Heures contrat / an</label>
                    <input {...register('contractHours')} type="number" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowForm(false); reset(); }}
                    className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg text-sm hover:bg-slate-50">Annuler</button>
                  <button type="submit" disabled={createMutation.isPending}
                    className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-60">
                    {createMutation.isPending ? 'Création…' : 'Créer le client'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dialog toggle */}
        {confirmToggle && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${confirmToggle.isActive ? 'bg-orange-100' : 'bg-emerald-100'}`}>
                  {confirmToggle.isActive ? <PowerOff className="w-5 h-5 text-orange-600" /> : <Power className="w-5 h-5 text-emerald-600" />}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{confirmToggle.isActive ? 'Désactiver le compte ?' : 'Réactiver le compte ?'}</h3>
                  <p className="text-sm text-slate-500">{confirmToggle.isActive ? `${confirmToggle.name} ne pourra plus se connecter.` : `${confirmToggle.name} pourra à nouveau se connecter.`}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setConfirmToggle(null)} className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg text-sm hover:bg-slate-50">Annuler</button>
                <button onClick={() => toggleMutation.mutate({ userId: confirmToggle.userId, isActive: confirmToggle.isActive })} disabled={toggleMutation.isPending}
                  className={`flex-1 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-60 ${confirmToggle.isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                  {toggleMutation.isPending ? 'En cours…' : confirmToggle.isActive ? 'Désactiver' : 'Réactiver'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dialog suppression */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Supprimer définitivement ?</h3>
                  <p className="text-sm text-slate-500">{confirmDelete.name}</p>
                </div>
              </div>
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                Cette action est irréversible. Le client et tous ses tickets seront supprimés.
              </p>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-slate-500" />
                    <label className="text-sm font-medium text-slate-700">Confirmez votre mot de passe</label>
                  </div>
                  {deleteAttempts > 0 && <span className="text-xs font-semibold text-red-600">{deleteAttempts}/{MAX_ATTEMPTS} tentatives</span>}
                </div>
                <input type="password" value={deletePassword}
                  onChange={e => { setDeletePassword(e.target.value); setDeleteError(''); }}
                  placeholder="••••••••" disabled={deleteAttempts >= MAX_ATTEMPTS}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 outline-none disabled:bg-slate-50" />
                {deleteError && <p className="mt-1.5 text-xs text-red-600 font-medium">{deleteError}</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setConfirmDelete(null); setDeletePassword(''); setDeleteError(''); setDeleteAttempts(0); }}
                  className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg text-sm hover:bg-slate-50">Annuler</button>
                <button onClick={() => deleteMutation.mutate({ userId: confirmDelete.userId, password: deletePassword })}
                  disabled={deleteMutation.isPending || !deletePassword || deleteAttempts >= MAX_ATTEMPTS}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60">
                  {deleteMutation.isPending ? 'Vérification…' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white border border-slate-200 rounded-lg h-12 animate-pulse" />)}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-200" />
            <p className="font-medium">Aucun client</p>
            <p className="text-sm mt-1">Ajoutez votre premier client</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <SortTh label="Société" field="companyName" sort={sort} onSort={toggleSort} />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Contact</th>
                  <SortTh label="Statut" field="isActive" sort={sort} onSort={toggleSort} />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Contrat</th>
                  <SortTh label="Tickets" field="tickets" sort={sort} onSort={toggleSort} />
                  <SortTh label="Date" field="createdAt" sort={sort} onSort={toggleSort} />
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayed.map((c: any) => {
                  const isActive = c.user?.isActive ?? true;
                  return (
                    <tr key={c.id} className={`hover:bg-slate-50 transition-colors ${!isActive ? 'bg-orange-50/40' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-blue-100' : 'bg-slate-100'}`}>
                            <Building2 className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                          </div>
                          <Link href={`/manager/clients/${c.id}`} className="font-medium text-slate-800 hover:text-blue-700">
                            {c.companyName}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-700">{c.user?.name}</p>
                        <p className="text-xs text-slate-400">{c.user?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-600'}`}>
                          {isActive ? <><CheckCircle2 className="w-3 h-3" /> Actif</> : <><XCircle className="w-3 h-3" /> Désactivé</>}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {c.isContractual ? (
                          <div>
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Contrat</span>
                            {c.contractHours && (
                              <p className="text-xs text-slate-400 mt-1">{c.usedHours}h / {c.contractHours}h</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Hors contrat</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">{c.tickets?.length ?? 0}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(c.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link href={`/manager/clients/${c.id}`}
                            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors" title="Voir">
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button onClick={() => setConfirmToggle({ userId: c.user.id, isActive, name: c.user?.name ?? c.companyName })}
                            title={isActive ? 'Désactiver' : 'Réactiver'}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'hover:bg-orange-50 text-slate-400 hover:text-orange-600' : 'hover:bg-emerald-50 text-slate-400 hover:text-emerald-600'}`}>
                            {isActive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => setConfirmDelete({ userId: c.user.id, name: c.user?.name ?? c.companyName })}
                            title="Supprimer" className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
