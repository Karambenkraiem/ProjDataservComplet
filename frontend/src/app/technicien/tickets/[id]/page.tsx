'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { ticketsApi, interventionsApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { StatusBadge, PriorityBadge } from '@/components/tickets/TicketStatusBadge';
import { formatDateTime, TYPE_LABELS } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { ArrowLeft, MapPin, Monitor, Clock, FileText, CheckCircle, Download } from 'lucide-react';
import Link from 'next/link';

export default function TechnicienTicketDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [tab, setTab] = useState<'info' | 'fiche'>('info');
  const [showCloseModal, setShowCloseModal] = useState(false);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsApi.get(id),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => ticketsApi.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ticket', id] }),
  });

  const updateFicheMutation = useMutation({
    mutationFn: (data: any) => interventionsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ticket', id] }),
  });

  const closeMutation = useMutation({
    mutationFn: (data: any) => interventionsApi.close(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket', id] });
      setShowCloseModal(false);
    },
  });

  const { register: regFiche, handleSubmit: hsFiche } = useForm<Record<string, any>>({
    values: {
      description: ticket?.intervention?.description || '',
      resolution: ticket?.intervention?.resolution || '',
      hoursWorked: ticket?.intervention?.hoursWorked || 0,
      travelMinutes: ticket?.intervention?.travelMinutes || 0,
    },
  });

  const { register: regClose, handleSubmit: hsClose } = useForm<Record<string, any>>();

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!ticket) return null;

  const isClosed = ticket.status === 'CLOTURE' || ticket.status === 'RESOLU';

  return (
    <div className="flex flex-col h-full">
      <Header title="Détail du ticket" />
      <div className="flex-1 p-6 overflow-y-auto max-w-3xl mx-auto w-full">
        <Link href="/technicien/tickets" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        {/* Card principale */}
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400 mb-1">Type</p>
              <p className="flex items-center gap-1.5 text-slate-700">
                {ticket.type === 'SUR_SITE' ? <MapPin className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
                {TYPE_LABELS[ticket.type]}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Client</p>
              <p className="font-medium text-slate-700">{ticket.client?.companyName}</p>
              <p className="text-xs text-slate-400">{ticket.client?.user?.phone}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Créé le</p>
              <p className="text-slate-700">{formatDateTime(ticket.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Actions statut */}
        {!isClosed && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
            <p className="text-sm font-medium text-slate-700 mb-3">Changer le statut</p>
            <div className="flex gap-2 flex-wrap">
              {ticket.status === 'NOUVEAU' && (
                <button onClick={() => updateStatusMutation.mutate('EN_COURS')}
                  disabled={updateStatusMutation.isPending}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-60">
                  Démarrer l'intervention
                </button>
              )}
              {ticket.status === 'EN_COURS' && (
                <button onClick={() => setShowCloseModal(true)}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Clôturer l'intervention
                </button>
              )}
            </div>
          </div>
        )}

        {/* Fiche d'intervention */}
        {ticket.intervention && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4" /> Fiche d'intervention
            </h3>

            {isClosed ? (
              /* Vue lecture seule */
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Heures travaillées</p>
                    <p className="font-bold text-slate-700 text-lg">{ticket.intervention.hoursWorked}h</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Déplacement</p>
                    <p className="font-bold text-slate-700 text-lg">{ticket.intervention.travelMinutes} min</p>
                  </div>
                </div>
                {ticket.intervention.description && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Description</p>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{ticket.intervention.description}</p>
                  </div>
                )}
                {ticket.intervention.resolution && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Résolution</p>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{ticket.intervention.resolution}</p>
                  </div>
                )}
                {ticket.intervention.pdfUrl && (
                  // <a href={`${process.env.NEXT_PUBLIC_API_URL}${ticket.intervention.pdfUrl}`}
                  <a href={ticket.intervention.pdfUrl}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <Download className="w-4 h-4" /> Télécharger la fiche PDF
                  </a>
                )}
              </div>
            ) : (
              /* Formulaire éditable */
              <form onSubmit={hsFiche((d) => updateFicheMutation.mutate(d))} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description de l'intervention *</label>
                  <textarea {...regFiche('description')} rows={3}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Résolution / Remarques</label>
                  <textarea {...regFiche('resolution')} rows={2}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Heures travaillées</label>
                    <input {...regFiche('hoursWorked')} type="number" step="0.5" min="0"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Déplacement (min)</label>
                    <input {...regFiche('travelMinutes')} type="number" min="0"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
                <button type="submit" disabled={updateFicheMutation.isPending}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors disabled:opacity-60">
                  {updateFicheMutation.isPending ? 'Sauvegarde…' : 'Sauvegarder la fiche'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Modal clôture */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Clôturer l'intervention</h2>
              <p className="text-sm text-slate-500 mt-1">Un PDF sera généré automatiquement</p>
            </div>
            <form onSubmit={hsClose((d) => closeMutation.mutate(d))} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <textarea {...regClose('description', { required: true })} rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Résolution</label>
                <textarea {...regClose('resolution')} rows={2}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Heures travaillées *</label>
                  <input {...regClose('hoursWorked', { required: true, min: 0 })} type="number" step="0.5" defaultValue={0}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Déplacement (min) *</label>
                  <input {...regClose('travelMinutes', { required: true, min: 0 })} type="number" defaultValue={0}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCloseModal(false)}
                  className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg text-sm hover:bg-slate-50">
                  Annuler
                </button>
                <button type="submit" disabled={closeMutation.isPending}
                  className="flex-1 bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-800 disabled:opacity-60">
                  {closeMutation.isPending ? 'Clôture…' : 'Confirmer la clôture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
