'use client';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi, clientsApi, usersApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { StatusBadge, PriorityBadge } from '@/components/tickets/TicketStatusBadge';
import { useForm } from 'react-hook-form';
import { Plus, X, ChevronUp, ChevronDown, ChevronsUpDown, Eye } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatDate, TYPE_LABELS } from '@/lib/utils';

const STATUSES = ['', 'NOUVEAU', 'EN_COURS', 'RESOLU', 'CLOTURE'];
const PRIORITIES = ['', 'NORMAL', 'URGENT'];
const STATUS_LABELS: Record<string, string> = {
  NOUVEAU: 'Nouveau', EN_COURS: 'En cours', RESOLU: 'Résolu', CLOTURE: 'Clôturé',
};

type SortField = 'createdAt' | 'priority' | 'status' | 'client' | 'technicien' | 'title';
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

const PRIORITY_ORDER: Record<string, number> = { URGENT: 2, NORMAL: 1 };
const STATUS_ORDER: Record<string, number> = { NOUVEAU: 4, EN_COURS: 3, RESOLU: 2, CLOTURE: 1 };

export default function ManagerTicketsPage() {
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    status: searchParams.get('status') ?? '',
    priority: searchParams.get('priority') ?? '',
  });
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({ field: 'createdAt', dir: 'desc' });

  const params: Record<string, string> = {};
  if (filters.status) params.status = filters.status;
  if (filters.priority) params.priority = filters.priority;

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets', params],
    queryFn: () => ticketsApi.list(params),
  });
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: clientsApi.list });
  const { data: techniciens = [] } = useQuery({ queryKey: ['techniciens'], queryFn: usersApi.techniciens });

  const { register, handleSubmit, reset } = useForm<Record<string, any>>();
  const createMutation = useMutation({
    mutationFn: ticketsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tickets'] }); setShowForm(false); reset(); },
  });

  const toggleSort = (field: SortField) => {
    setSort(s => s.field === field ? { ...s, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { field, dir: 'desc' });
  };

  const displayed = useMemo(() => {
    let list = [...tickets];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t: any) =>
        t.title?.toLowerCase().includes(q) ||
        t.client?.companyName?.toLowerCase().includes(q) ||
        t.technicien?.name?.toLowerCase().includes(q)
      );
    }
    list.sort((a: any, b: any) => {
      let av: any, bv: any;
      if (sort.field === 'createdAt') { av = new Date(a.createdAt).getTime(); bv = new Date(b.createdAt).getTime(); }
      else if (sort.field === 'priority') { av = PRIORITY_ORDER[a.priority] ?? 0; bv = PRIORITY_ORDER[b.priority] ?? 0; }
      else if (sort.field === 'status') { av = STATUS_ORDER[a.status] ?? 0; bv = STATUS_ORDER[b.status] ?? 0; }
      else if (sort.field === 'client') { av = a.client?.companyName ?? ''; bv = b.client?.companyName ?? ''; }
      else if (sort.field === 'technicien') { av = a.technicien?.name ?? ''; bv = b.technicien?.name ?? ''; }
      else if (sort.field === 'title') { av = a.title ?? ''; bv = b.title ?? ''; }
      else { av = 0; bv = 0; }
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [tickets, search, sort]);

  return (
    <div className="flex flex-col h-full">
      <Header title="Tickets d'intervention" subtitle={`${displayed.length} ticket(s)`} />
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">

        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors">
            <Plus className="w-4 h-4" /> Nouveau ticket
          </button>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white w-48 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white">
            {STATUSES.map(s => <option key={s} value={s}>{s ? STATUS_LABELS[s] : 'Tous les statuts'}</option>)}
          </select>
          <select value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white">
            {PRIORITIES.map(p => <option key={p} value={p}>{p || 'Toutes priorités'}</option>)}
          </select>
        </div>

        {/* Modal création */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">Nouveau ticket</h2>
                <button onClick={() => { setShowForm(false); reset(); }}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Titre *</label>
                  <input {...register('title', { required: true })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                  <textarea {...register('description', { required: true })} rows={3}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                    <select {...register('type', { required: true })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                      <option value="SUR_SITE">Sur site</option>
                      <option value="DISTANCE">À distance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Priorité</label>
                    <select {...register('priority')}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                      <option value="NORMAL">Normal</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Client *</label>
                  <select {...register('clientId', { required: true })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="">Sélectionner un client</option>
                    {clients.map((c: any) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Technicien</label>
                  <select {...register('technicienId')}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="">Non assigné</option>
                    {techniciens.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowForm(false); reset(); }}
                    className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg text-sm hover:bg-slate-50">Annuler</button>
                  <button type="submit" disabled={createMutation.isPending}
                    className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-60">
                    {createMutation.isPending ? 'Création…' : 'Créer le ticket'}
                  </button>
                </div>
              </form>
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
            <p className="text-lg font-medium mb-1">Aucun ticket</p>
            <p className="text-sm">Créez votre premier ticket d'intervention</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <SortTh label="Titre" field="title" sort={sort} onSort={toggleSort} />
                  <SortTh label="Client" field="client" sort={sort} onSort={toggleSort} />
                  <SortTh label="Technicien" field="technicien" sort={sort} onSort={toggleSort} />
                  <SortTh label="Statut" field="status" sort={sort} onSort={toggleSort} />
                  <SortTh label="Priorité" field="priority" sort={sort} onSort={toggleSort} />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                  <SortTh label="Date" field="createdAt" sort={sort} onSort={toggleSort} />
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayed.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/manager/tickets/${t.id}`} className="font-medium text-slate-800 hover:text-blue-700 line-clamp-1">
                        {t.title}
                      </Link>
                      <p className="text-xs text-slate-400 font-mono">#{t.id.slice(0, 8).toUpperCase()}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{t.client?.companyName ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{t.technicien?.name ?? <span className="text-slate-300 italic">Non assigné</span>}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                    <td className="px-4 py-3 text-slate-500">{TYPE_LABELS[t.type as keyof typeof TYPE_LABELS] ?? t.type}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(t.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/manager/tickets/${t.id}`}
                        className="w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
