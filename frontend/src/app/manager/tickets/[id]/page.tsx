'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { ticketsApi, usersApi, interventionsApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { StatusBadge, PriorityBadge } from '@/components/tickets/TicketStatusBadge';
import { formatDateTime, TYPE_LABELS } from '@/lib/utils';
import { ArrowLeft, User, MapPin, Monitor, Clock, FileText, Download } from 'lucide-react';
import Link from 'next/link';

export default function ManagerTicketDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [showAssign, setShowAssign] = useState(false);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsApi.get(id),
  });

  const { data: techniciens = [] } = useQuery({
    queryKey: ['techniciens'],
    queryFn: usersApi.techniciens,
  });

  const assignMutation = useMutation({
    mutationFn: ({ technicienId }: { technicienId: string }) => ticketsApi.assign(id, technicienId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ticket', id] }); setShowAssign(false); },
  });

  const closeMutation = useMutation({
    mutationFn: (data: any) => interventionsApi.close(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ticket', id] }),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!ticket) return null;

  return (
    <div className="flex flex-col h-full">
      <Header title="Détail du ticket" />
      <div className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full">
        <Link href="/manager/tickets" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour aux tickets
        </Link>

        {/* Header ticket */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-mono text-slate-400 mb-1">#{ticket.id.slice(0, 8).toUpperCase()}</p>
              <h2 className="text-xl font-bold text-slate-800">{ticket.title}</h2>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed mb-4">{ticket.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400 mb-1">Type</p>
              <p className="flex items-center gap-1.5 text-slate-700">
                {ticket.type === 'SUR_SITE' ? <MapPin className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
                {TYPE_LABELS[ticket.type]}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Client</p>
              <p className="text-slate-700 font-medium">{ticket.client?.companyName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Créé le</p>
              <p className="text-slate-700">{formatDateTime(ticket.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Mis à jour</p>
              <p className="text-slate-700">{formatDateTime(ticket.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Technicien */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2"><User className="w-4 h-4" /> Technicien assigné</h3>
            <button onClick={() => setShowAssign(!showAssign)}
              className="text-sm text-blue-600 hover:underline">
              {ticket.technicien ? 'Réassigner' : 'Assigner'}
            </button>
          </div>

          {ticket.technicien ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-semibold">
                {ticket.technicien.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-slate-700">{ticket.technicien.name}</p>
                <p className="text-sm text-slate-400">{ticket.technicien.email}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">Aucun technicien assigné</p>
          )}

          {showAssign && (
            <div className="mt-4 flex gap-2">
              <select id="tech-select"
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">Sélectionner un technicien</option>
                {techniciens.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.activeTickets} tickets actifs)</option>
                ))}
              </select>
              <button
                onClick={() => {
                  const sel = document.getElementById('tech-select') as HTMLSelectElement;
                  if (sel.value) assignMutation.mutate({ technicienId: sel.value });
                }}
                disabled={assignMutation.isPending}
                className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors disabled:opacity-60">
                Confirmer
              </button>
            </div>
          )}
        </div>

        {/* Intervention */}
        {ticket.intervention && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4" /> Fiche d'intervention
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Heures travaillées</p>
                <p className="font-semibold text-slate-700 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{ticket.intervention.hoursWorked}h</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Déplacement</p>
                <p className="font-semibold text-slate-700">{ticket.intervention.travelMinutes} min</p>
              </div>
            </div>
            {ticket.intervention.description && (
              <div className="mb-3">
                <p className="text-xs text-slate-400 mb-1">Description</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{ticket.intervention.description}</p>
              </div>
            )}
            {ticket.intervention.pdfUrl && (
              // <a href={`${process.env.NEXT_PUBLIC_API_URL}${ticket.intervention.pdfUrl}`}
              <a href={ticket.intervention.pdfUrl}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline mt-3">
                <Download className="w-4 h-4" /> Télécharger la fiche PDF
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
