'use client';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { TicketCard } from '@/components/tickets/TicketCard';
import { Clock, CheckCircle2, AlertTriangle, Wrench } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

function StatCard({ label, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function TechnicienDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'technicien'],
    queryFn: dashboardApi.technicien,
    refetchInterval: 30_000,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { myTickets = [], todayDone = 0, totalHours = 0, urgentCount = 0 } = data || {};

  return (
    <div className="flex flex-col h-full">
      <Header title="Mon tableau de bord" subtitle={`Bonjour, ${user?.name}`} />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Tickets actifs" value={myTickets.length} icon={Wrench}
            color="text-emerald-700" bg="bg-emerald-50" />
          <StatCard label="Urgents" value={urgentCount} icon={AlertTriangle}
            color="text-red-700" bg="bg-red-50" />
          <StatCard label="Résolus aujourd'hui" value={todayDone} icon={CheckCircle2}
            color="text-blue-700" bg="bg-blue-50" />
          <StatCard label="Heures totales" value={`${totalHours}h`} icon={Clock}
            color="text-violet-700" bg="bg-violet-50" />
        </div>

        {/* Tickets urgents */}
        {myTickets.filter((t: any) => t.priority === 'URGENT').length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Tickets urgents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {myTickets
                .filter((t: any) => t.priority === 'URGENT')
                .map((t: any) => <TicketCard key={t.id} ticket={t} basePath="/technicien/tickets" />)}
            </div>
          </div>
        )}

        {/* Tous mes tickets */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Mes tickets actifs
          </h2>
          {myTickets.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-300" />
              <p className="font-medium">Aucun ticket actif</p>
              <p className="text-sm mt-1">Bien joué, tout est à jour !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {myTickets
                .filter((t: any) => t.priority !== 'URGENT')
                .map((t: any) => <TicketCard key={t.id} ticket={t} basePath="/technicien/tickets" />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
