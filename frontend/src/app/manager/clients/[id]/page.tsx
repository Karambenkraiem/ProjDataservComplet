'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { clientsApi, rapportsApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { TicketCard } from '@/components/tickets/TicketCard';
import { formatDate, downloadBlob } from '@/lib/utils';
import {
  ArrowLeft, Building2, Mail, Phone, MapPin,
  Clock, Ticket, FileDown, CheckCircle2, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function ManagerClientDetail() {
  const { id } = useParams<{ id: string }>();
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

  const { data: stats, isLoading } = useQuery({
    queryKey: ['client-stats', id],
    queryFn: () => clientsApi.stats(id),
  });

  const handleDownloadReport = async () => {
    setDownloadingReport(true);
    try {
      const blob = await rapportsApi.mensuel(id, reportMonth, reportYear);
      downloadBlob(blob, `rapport-${stats?.client?.companyName}-${reportYear}-${String(reportMonth).padStart(2, '0')}.xlsx`);
    } finally {
      setDownloadingReport(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!stats) return null;

  const { client, totalTickets, openTickets, usedHours, contractHours, remainingHours } = stats;
  const contractPct = contractHours ? Math.min(100, Math.round((usedHours / contractHours) * 100)) : 0;

  return (
    <div className="flex flex-col h-full">
      <Header title="Détail client" />
      <div className="flex-1 p-6 overflow-y-auto">
        <Link
          href="/manager/clients"
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux clients
        </Link>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Colonne gauche — infos client */}
          <div className="space-y-4">

            {/* Fiche client */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-lg">{client.companyName}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    client.isContractual
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {client.isContractual ? 'Sous contrat' : 'Hors contrat'}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{client.user?.email}</span>
                </div>
                {client.user?.phone && (
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{client.user.phone}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{client.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>Déplacement : {client.travelTimeMinutes} min</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                Client depuis le {formatDate(client.createdAt)}
              </div>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <p className="text-2xl font-bold text-slate-800">{totalTickets}</p>
                <p className="text-xs text-slate-500 mt-0.5">Total tickets</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{openTickets}</p>
                <p className="text-xs text-slate-500 mt-0.5">En cours</p>
              </div>
            </div>

            {/* Contrat heures */}
            {client.isContractual && contractHours && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Contrat d'heures
                </h3>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Consommées</span>
                  <span className="font-semibold text-slate-700">{usedHours}h / {contractHours}h</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      contractPct >= 90 ? 'bg-red-500' :
                      contractPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${contractPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-medium ${contractPct >= 90 ? 'text-red-600' : 'text-slate-500'}`}>
                    {contractPct}% utilisé
                  </span>
                  <span className={`flex items-center gap-1 ${remainingHours <= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {remainingHours <= 0
                      ? <><AlertCircle className="w-3 h-3" /> Dépassé</>
                      : <><CheckCircle2 className="w-3 h-3" /> {remainingHours}h restantes</>
                    }
                  </span>
                </div>
              </div>
            )}

            {/* Rapport mensuel */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
                <FileDown className="w-4 h-4" /> Rapport mensuel
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <select
                  value={reportMonth}
                  onChange={e => setReportMonth(+e.target.value)}
                  className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleDateString('fr-TN', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={reportYear}
                  onChange={e => setReportYear(+e.target.value)}
                  className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button
                onClick={handleDownloadReport}
                disabled={downloadingReport}
                className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors disabled:opacity-60"
              >
                <FileDown className="w-4 h-4" />
                {downloadingReport ? 'Génération…' : 'Télécharger Excel'}
              </button>
            </div>
          </div>

          {/* Colonne droite — historique tickets */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                <Ticket className="w-4 h-4 text-slate-500" />
                <h2 className="font-semibold text-slate-800">
                  Historique des tickets
                  <span className="ml-2 text-sm font-normal text-slate-400">({client.tickets?.length ?? 0})</span>
                </h2>
              </div>

              {!client.tickets || client.tickets.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Ticket className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                  <p className="text-sm">Aucun ticket pour ce client</p>
                </div>
              ) : (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {client.tickets.map((ticket: any) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      basePath="/manager/tickets"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
