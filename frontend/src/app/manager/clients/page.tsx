'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Plus, X, Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

type ClientFormData = {
  name: string;
  companyName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  travelTimeMinutes?: number;
  isContractual?: boolean;
  contractHours?: number;
};

export default function ManagerClientsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const { data: clients = [], isLoading } = useQuery({ queryKey: ['clients'], queryFn: clientsApi.list });

  const { register, handleSubmit, reset, watch } = useForm<ClientFormData>({
    defaultValues: { isContractual: false },
  });
  const isContractual = watch('isContractual');

  const createMutation = useMutation({
    mutationFn: clientsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); setShowForm(false); reset(); },
  });

  return (
    <div className="flex flex-col h-full">
      <Header title="Clients" subtitle={`${clients.length} client(s)`} />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors">
            <Plus className="w-4 h-4" /> Nouveau client
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
                <h2 className="font-semibold text-slate-800">Nouveau client</h2>
                <button onClick={() => { setShowForm(false); reset(); }}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet *</label>
                    <input {...register('name', { required: true })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Société *</label>
                    <input {...register('companyName', { required: true })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input {...register('email', { required: true })} type="email"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe *</label>
                    <input {...register('password', { required: true, minLength: 8 })} type="password"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                    <input {...register('phone')}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                  <input {...register('address')}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Déplacement (min)</label>
                  <input {...register('travelTimeMinutes')} type="number" defaultValue={0}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input {...register('isContractual')} type="checkbox" className="w-4 h-4 rounded text-blue-600" />
                  <span className="text-sm text-slate-700">Client sous contrat</span>
                </label>
                {isContractual && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Heures contrat / an</label>
                    <input {...register('contractHours')} type="number"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowForm(false); reset(); }}
                    className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg text-sm hover:bg-slate-50">
                    Annuler
                  </button>
                  <button type="submit" disabled={createMutation.isPending}
                    className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-60">
                    {createMutation.isPending ? 'Création…' : 'Créer le client'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border rounded-xl h-36 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {clients.map((c: any) => (
              <Link key={c.id} href={`/manager/clients/${c.id}`}>
                <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-blue-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{c.companyName}</p>
                      <p className="text-xs text-slate-500 truncate">{c.user?.name}</p>
                    </div>
                    {c.isContractual && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                        Contrat
                      </span>
                    )}
                  </div>
                  {c.isContractual && c.contractHours && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Heures consommées</span>
                        <span>{c.usedHours}h / {c.contractHours}h</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full">
                        <div className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(100, (c.usedHours / c.contractHours) * 100)}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{c.tickets?.length ?? 0} ticket(s)</span>
                    <span>{formatDate(c.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}