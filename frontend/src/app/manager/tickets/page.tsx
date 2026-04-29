// 'use client';
// import { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { ticketsApi, clientsApi, usersApi } from '@/lib/api';
// import { Header } from '@/components/layout/Header';
// import { TicketCard } from '@/components/tickets/TicketCard';
// import { useForm } from 'react-hook-form';
// import { Plus, X, Filter } from 'lucide-react';

// const STATUSES = ['', 'NOUVEAU', 'EN_COURS', 'RESOLU', 'CLOTURE'];
// const PRIORITIES = ['', 'NORMAL', 'URGENT'];

// export default function ManagerTicketsPage() {
//   const qc = useQueryClient();
//   const [showForm, setShowForm] = useState(false);
//   const [filters, setFilters] = useState({ status: '', priority: '' });

//   const params: Record<string, string> = {};
//   if (filters.status) params.status = filters.status;
//   if (filters.priority) params.priority = filters.priority;

//   const { data: tickets = [], isLoading } = useQuery({
//     queryKey: ['tickets', params],
//     queryFn: () => ticketsApi.list(params),
//   });

//   const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: clientsApi.list });
//   const { data: techniciens = [] } = useQuery({ queryKey: ['techniciens'], queryFn: usersApi.techniciens });

//   const { register, handleSubmit, reset } = useForm();

//   const createMutation = useMutation({
//     mutationFn: ticketsApi.create,
//     onSuccess: () => { qc.invalidateQueries({ queryKey: ['tickets'] }); setShowForm(false); reset(); },
//   });

//   return (
//     <div className="flex flex-col h-full">
//       <Header title="Tickets d'intervention" subtitle={`${tickets.length} ticket(s)`} />

//       <div className="flex-1 p-6 overflow-y-auto">
//         {/* Toolbar */}
//         <div className="flex items-center gap-3 mb-6 flex-wrap">
//           <button
//             onClick={() => setShowForm(true)}
//             className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
//           >
//             <Plus className="w-4 h-4" /> Nouveau ticket
//           </button>

//           <select
//             value={filters.status}
//             onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
//             className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white"
//           >
//             {STATUSES.map(s => <option key={s} value={s}>{s || 'Tous les statuts'}</option>)}
//           </select>

//           <select
//             value={filters.priority}
//             onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}
//             className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white"
//           >
//             {PRIORITIES.map(p => <option key={p} value={p}>{p || 'Toutes priorités'}</option>)}
//           </select>
//         </div>

//         {/* Modal créer ticket */}
//         {showForm && (
//           <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
//               <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
//                 <h2 className="font-semibold text-slate-800">Nouveau ticket</h2>
//                 <button onClick={() => { setShowForm(false); reset(); }} className="text-slate-400 hover:text-slate-600">
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
//               <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="p-6 space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">Titre *</label>
//                   <input {...register('title', { required: true })}
//                     className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
//                   <textarea {...register('description', { required: true })} rows={3}
//                     className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none" />
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
//                     <select {...register('type', { required: true })}
//                       className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
//                       <option value="SUR_SITE">Sur site</option>
//                       <option value="DISTANCE">À distance</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-1">Priorité</label>
//                     <select {...register('priority')}
//                       className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
//                       <option value="NORMAL">Normal</option>
//                       <option value="URGENT">Urgent</option>
//                     </select>
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">Client *</label>
//                   <select {...register('clientId', { required: true })}
//                     className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
//                     <option value="">Sélectionner un client</option>
//                     {clients.map((c: any) => (
//                       <option key={c.id} value={c.id}>{c.companyName}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">Technicien</label>
//                   <select {...register('technicienId')}
//                     className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
//                     <option value="">Non assigné</option>
//                     {techniciens.map((t: any) => (
//                       <option key={t.id} value={t.id}>{t.name}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="flex gap-3 pt-2">
//                   <button type="button" onClick={() => { setShowForm(false); reset(); }}
//                     className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors">
//                     Annuler
//                   </button>
//                   <button type="submit" disabled={createMutation.isPending}
//                     className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors disabled:opacity-60">
//                     {createMutation.isPending ? 'Création…' : 'Créer le ticket'}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* Tickets grid */}
//         {isLoading ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//             {Array.from({ length: 6 }).map((_, i) => (
//               <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse h-40" />
//             ))}
//           </div>
//         ) : tickets.length === 0 ? (
//           <div className="text-center py-16 text-slate-400">
//             <p className="text-lg font-medium mb-1">Aucun ticket</p>
//             <p className="text-sm">Créez votre premier ticket d'intervention</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//             {tickets.map((t: any) => <TicketCard key={t.id} ticket={t} basePath="/manager/tickets" />)}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi, clientsApi, usersApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { TicketCard } from '@/components/tickets/TicketCard';
import { useForm } from 'react-hook-form';
import { Plus, X } from 'lucide-react';

const STATUSES = ['', 'NOUVEAU', 'EN_COURS', 'RESOLU', 'CLOTURE'];
const PRIORITIES = ['', 'NORMAL', 'URGENT'];

export default function ManagerTicketsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '' });

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

  return (
    <div className="flex flex-col h-full">
      <Header title="Tickets d'intervention" subtitle={`${tickets.length} ticket(s)`} />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors">
            <Plus className="w-4 h-4" /> Nouveau ticket
          </button>
          <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white">
            {STATUSES.map(s => <option key={s} value={s}>{s || 'Tous les statuts'}</option>)}
          </select>
          <select value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white">
            {PRIORITIES.map(p => <option key={p} value={p}>{p || 'Toutes priorités'}</option>)}
          </select>
        </div>

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

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse h-40" />)}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg font-medium mb-1">Aucun ticket</p>
            <p className="text-sm">Créez votre premier ticket d'intervention</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tickets.map((t: any) => <TicketCard key={t.id} ticket={t} basePath="/manager/tickets" />)}
          </div>
        )}
      </div>
    </div>
  );
}