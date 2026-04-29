'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi, clientsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Header } from '@/components/layout/Header';
import { TicketCard } from '@/components/tickets/TicketCard';
import { useForm } from 'react-hook-form';
import { Plus, X, Clock, Ticket, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ClientTicketsPage() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [showForm, setShowForm] = useState(false);

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketsApi.list(),
  });

  const { data: clientProfile } = useQuery({
    queryKey: ['client-me'],
    queryFn: clientsApi.me,
  });

  const { register, handleSubmit, reset } = useForm();

  const createMutation = useMutation({
    mutationFn: (data: any) => ticketsApi.create({ ...data, clientId: clientProfile?.id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tickets'] }); setShowForm(false); reset(); },
  });

  const openCount = tickets.filter((t: any) => ['NOUVEAU', 'EN_COURS'].includes(t.status)).length;
  const resolvedCount = tickets.filter((t: any) => t.status === 'RESOLU' || t.status === 'CLOTURE').length;
  const urgentCount = tickets.filter((t: any) => t.priority === 'URGENT' && t.status !== 'CLOTURE').length;

  return (
    <div className="flex flex-col h-full">
      <Header title="Mes tickets" subtitle={`${tickets.length} ticket(s) au total`} />
      <div className="flex-1 p-6 overflow-y-auto">

        {/* Contrat info */}
        {clientProfile?.isContractual && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-700">Contrat d'heures</p>
              <p className="text-sm text-slate-500">{clientProfile.usedHours}h / {clientProfile.contractHours}h</p>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  (clientProfile.usedHours / clientProfile.contractHours) >= 0.9
                    ? 'bg-red-500' : (clientProfile.usedHours / clientProfile.contractHours) >= 0.7
                    ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (clientProfile.usedHours / clientProfile.contractHours) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {Math.max(0, clientProfile.contractHours - clientProfile.usedHours)}h restantes
            </p>
          </div>
        )}

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'En cours', value: openCount, icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50' },
            { label: 'Résolus', value: resolvedCount, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'Urgents', value: urgentCount, icon: AlertTriangle, color: 'text-red-700', bg: 'bg-red-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Tous mes tickets</h2>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-800 transition-colors">
            <Plus className="w-4 h-4" /> Nouveau ticket
          </button>
        </div>

        {/* Modal créer ticket */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">Nouveau ticket</h2>
                <button onClick={() => { setShowForm(false); reset(); }}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Titre du problème *</label>
                  <input {...register('title', { required: true })}
                    placeholder="Ex: Panne imprimante bureau 3"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                  <textarea {...register('description', { required: true })} rows={4}
                    placeholder="Décrivez le problème en détail…"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                    <select {...register('type')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                      <option value="SUR_SITE">Sur site</option>
                      <option value="DISTANCE">À distance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Urgence</label>
                    <select {...register('priority')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                      <option value="NORMAL">Normal</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowForm(false); reset(); }}
                    className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg text-sm hover:bg-slate-50">Annuler</button>
                  <button type="submit" disabled={createMutation.isPending}
                    className="flex-1 bg-violet-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-violet-800 disabled:opacity-60">
                    {createMutation.isPending ? 'Envoi…' : 'Envoyer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tickets */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white border rounded-xl h-40 animate-pulse" />)}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Ticket className="w-10 h-10 mx-auto mb-2 text-slate-200" />
            <p className="font-medium">Aucun ticket pour le moment</p>
            <p className="text-sm mt-1">Créez votre premier ticket en cas de problème</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map((t: any) => <TicketCard key={t.id} ticket={t} basePath="/client/tickets" />)}
          </div>
        )}
      </div>
    </div>
  );
}
