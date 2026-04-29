'use client';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi, ticketsApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { TicketCard } from '@/components/tickets/TicketCard';
import { StatusBadge, PriorityBadge } from '@/components/tickets/TicketStatusBadge';
import { formatDate } from '@/lib/utils';
import { Users, Building2, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ManagerDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'manager'],
    queryFn: dashboardApi.manager,
    refetchInterval: 30_000,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { stats, techniciens, recentTickets, topClients } = data || {};

  return (
    <div className="flex flex-col h-full">
      <Header title="Tableau de bord" subtitle={`Bonjour, voici l'activité du jour`} />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Stats */}
        {stats && <StatsCards stats={stats} />}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Tickets récents */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Tickets récents</h2>
              <Link href="/manager/tickets" className="text-sm text-blue-600 hover:underline">Voir tout →</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentTickets?.slice(0, 8).map((t: any) => (
                <Link key={t.id} href={`/manager/tickets/${t.id}`}>
                  <div className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{t.title}</p>
                      <p className="text-xs text-slate-500">{t.client?.companyName} · {formatDate(t.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar panels */}
          <div className="space-y-6">
            {/* Techniciens */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                <Users className="w-4 h-4 text-slate-500" />
                <h2 className="font-semibold text-slate-800">Techniciens</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {techniciens?.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-semibold">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{t.name}</p>
                        <p className="text-xs text-slate-400">{t.activeTickets} ticket(s) actif(s)</p>
                      </div>
                    </div>
                    {t.urgentTickets > 0 && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                        {t.urgentTickets} urgent
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Clients contractuels */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                <Building2 className="w-4 h-4 text-slate-500" />
                <h2 className="font-semibold text-slate-800">Contrats heures</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {topClients?.map((c: any) => {
                  const pct = c.contractHours ? Math.min(100, Math.round((c.usedHours / c.contractHours) * 100)) : 0;
                  return (
                    <div key={c.id} className="px-5 py-3">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium text-slate-700 truncate">{c.companyName}</p>
                        <p className="text-xs text-slate-500 flex-shrink-0 ml-2">{c.usedHours}h / {c.contractHours}h</p>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
