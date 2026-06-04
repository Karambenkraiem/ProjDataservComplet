'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clientsApi, rapportsApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { downloadBlob } from '@/lib/utils';
import { FileDown, Calendar, Clock, Ticket } from 'lucide-react';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export default function ClientRapportsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());
  const [loading, setLoading] = useState(false);

  const { data: client } = useQuery({
    queryKey: ['client-me'],
    queryFn: clientsApi.me,
  });

  const handleDownload = async () => {
    if (!client?.id) return;
    setLoading(true);
    try {
      const blob = await rapportsApi.mensuel(client.id, month, year);
      downloadBlob(blob, `rapport-${year}-${String(month).padStart(2, '0')}.xlsx`);
    } finally {
      setLoading(false);
    }
  };

  const usedPct = client?.contractHours
    ? Math.min(100, ((client.usedHours ?? 0) / client.contractHours) * 100)
    : 0;

  return (
    <div className="flex flex-col h-full">
      <Header title="Mes rapports" subtitle="Historique et téléchargements" />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl space-y-6">

          {/* Résumé forfait */}
          {client?.isContractual && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-violet-600" />
                Consommation du forfait
              </h2>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">{client.companyName}</span>
                <span className="text-sm font-semibold text-slate-800">
                  {client.usedHours ?? 0} h / {client.contractHours} h
                </span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full mb-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    usedPct > 85 ? 'bg-red-500' : usedPct > 60 ? 'bg-orange-400' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${usedPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>{usedPct.toFixed(1)}% consommé</span>
                <span className={usedPct > 85 ? 'text-red-500 font-semibold' : 'text-emerald-600 font-semibold'}>
                  {client.contractHours
                    ? `${(client.contractHours - (client.usedHours ?? 0)).toFixed(1)} h restantes`
                    : '—'}
                </span>
              </div>
            </div>
          )}

          {/* Rapport mensuel */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-600" />
              Rapport mensuel
            </h2>
            <p className="text-sm text-slate-500 mb-5">
              Téléchargez le détail de vos interventions pour un mois donné.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Mois</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(+e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-violet-500 outline-none"
                >
                  {MONTHS.map((m, i) => (
                    <option key={i + 1} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Année</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(+e.target.value)}
                  min={2020}
                  max={2030}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={loading || !client?.id}
              className="flex items-center gap-2 bg-violet-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-violet-800 transition-colors disabled:opacity-60"
            >
              <FileDown className="w-4 h-4" />
              {loading ? 'Génération en cours…' : `Télécharger — ${MONTHS[month - 1]} ${year}`}
            </button>
          </div>

          {/* Tickets récents */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-violet-600" />
              Historique des interventions
            </h2>
            {!client?.tickets?.length ? (
              <p className="text-sm text-slate-400 text-center py-6">Aucune intervention enregistrée.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {client.tickets.map((t: any) => (
                  <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{t.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {t.intervention?.hoursWorked
                          ? `${t.intervention.hoursWorked} h travaillées`
                          : 'En attente'}{' '}
                        · {t.type === 'SUR_SITE' ? 'Sur site' : 'À distance'}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                      t.status === 'CLOTURE'  ? 'bg-purple-100 text-purple-700' :
                      t.status === 'RESOLU'   ? 'bg-emerald-100 text-emerald-700' :
                      t.status === 'EN_COURS' ? 'bg-orange-100 text-orange-700' :
                                                'bg-blue-100 text-blue-700'
                    }`}>
                      {t.status === 'CLOTURE'  ? 'Clôturé' :
                       t.status === 'RESOLU'   ? 'Résolu' :
                       t.status === 'EN_COURS' ? 'En cours' : 'Nouveau'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
