import { DashboardStats } from '@/types';
import { Ticket, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface StatCardProps {
  label: string; value: number; icon: React.ElementType;
  color: string; bgColor: string; subtitle?: string; href: string;
}

function StatCard({ label, value, icon: Icon, color, bgColor, subtitle, href }: StatCardProps) {
  return (
    <Link href={href} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer">
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
    </Link>
  );
}

export function StatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total tickets" value={stats.totalTickets} icon={Ticket}
        color="text-blue-700" bgColor="bg-blue-50" subtitle={`+${stats.weekTickets} cette semaine`}
        href="/manager/tickets" />
      <StatCard label="Nouveaux" value={stats.nouveaux} icon={TrendingUp}
        color="text-indigo-700" bgColor="bg-indigo-50" subtitle={`${stats.todayTickets} aujourd'hui`}
        href="/manager/tickets?status=NOUVEAU" />
      <StatCard label="En cours" value={stats.enCours} icon={Clock}
        color="text-amber-700" bgColor="bg-amber-50"
        href="/manager/tickets?status=EN_COURS" />
      <StatCard label="Urgents" value={stats.urgents} icon={AlertTriangle}
        color="text-red-700" bgColor="bg-red-50" subtitle="Ouverts"
        href="/manager/tickets?priority=URGENT" />
    </div>
  );
}
