'use client';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { ticketsApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { StatusBadge, PriorityBadge } from '@/components/tickets/TicketStatusBadge';
import { formatDateTime, TYPE_LABELS } from '@/lib/utils';
import { ArrowLeft, MapPin, Monitor, User, Clock, FileText, Download } from 'lucide-react';
import Link from 'next/link';

export default function ClientTicketDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsApi.get(id),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!ticket) return null;

  return (
    <div className="flex flex-col h-full">
      <Header title="Détail du ticket" />
      <div className="flex-1 p-6 overflow-y-auto max-w-2xl mx-auto w-full">
        <Link href="/client/tickets" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-5">
          <ArrowLeft className="w-4 h-4" /> Retour à mes tickets
        </Link>

        {/* Ticket info */}
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
          <p className="text-sm text-slate-600 leading-relaxed mb-4">{ticket.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400 mb-1">Type d'intervention</p>
              <p className="flex items-center gap-1.5 text-slate-700">
                {ticket.type === 'SUR_SITE' ? <MapPin className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
                {TYPE_LABELS[ticket.type]}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Date de création</p>
              <p className="text-slate-700">{formatDateTime(ticket.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Technicien assigné */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2 mb-3 text-sm">
            <User className="w-4 h-4" /> Technicien assigné
          </h3>
          {ticket.technicien ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-semibold text-sm">
                {ticket.technicien.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-slate-700 text-sm">{ticket.technicien.name}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">En attente d'assignation…</p>
          )}
        </div>

        {/* Fiche intervention (si disponible) */}
        {ticket.intervention?.closedAt && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2 mb-4 text-sm">
              <FileText className="w-4 h-4" /> Rapport d'intervention
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Heures travaillées</p>
                <p className="font-bold text-slate-700">{ticket.intervention.hoursWorked}h</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Déplacement</p>
                <p className="font-bold text-slate-700">{ticket.intervention.travelMinutes} min</p>
              </div>
            </div>
            {ticket.intervention.description && (
              <div className="mb-3">
                <p className="text-xs font-medium text-slate-500 mb-1">Description</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{ticket.intervention.description}</p>
              </div>
            )}
            {ticket.intervention.resolution && (
              <div className="mb-3">
                <p className="text-xs font-medium text-slate-500 mb-1">Résolution</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{ticket.intervention.resolution}</p>
              </div>
            )}
            {ticket.intervention.pdfUrl && (
              // <a href={`${process.env.NEXT_PUBLIC_API_URL}${ticket.intervention.pdfUrl}`}
              <a href={ticket.intervention.pdfUrl}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-violet-700 text-white text-sm rounded-lg hover:bg-violet-800 transition-colors">
                <Download className="w-4 h-4" /> Télécharger la fiche PDF
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
