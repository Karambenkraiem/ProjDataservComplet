import { DashboardStats } from '@/types';
import { Ticket, Clock, CheckCircle, XCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface StatCardProps {
  label: string; value: number; icon: React.ElementType;
  color: string; bgColor: string; subtitle?: string;
}

function StatCard({ label, value, icon: Icon, color, bgColor, subtitle }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}

export function StatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total tickets" value={stats.totalTickets} icon={Ticket}
        color="text-blue-700" bgColor="bg-blue-50" subtitle={`+${stats.weekTickets} cette semaine`} />
      <StatCard label="Nouveaux" value={stats.nouveaux} icon={TrendingUp}
        color="text-indigo-700" bgColor="bg-indigo-50" subtitle={`${stats.todayTickets} aujourd'hui`} />
      <StatCard label="En cours" value={stats.enCours} icon={Clock}
        color="text-amber-700" bgColor="bg-amber-50" />
      <StatCard label="Urgents" value={stats.urgents} icon={AlertTriangle}
        color="text-red-700" bgColor="bg-red-50" subtitle="Ouverts" />
    </div>
  );
}
