'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { StatusBadge, PriorityBadge } from '@/components/tickets/TicketStatusBadge';
import { formatDate } from '@/lib/utils';
import {
  Users, Clock, CheckCircle2, AlertTriangle, TrendingUp,
  ChevronDown, ChevronUp, Star, Wrench, XCircle, BarChart3,
} from 'lucide-react';

const fetchRendement = () =>
  api.get('/techniciens/rendement').then((r) => r.data);

// ── Grade badge ──────────────────────────────────────────────────────────────
function GradeBadge({ grade, score }: { grade: string; score: number }) {
  const colors: Record<string, string> = {
    A: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    B: 'bg-blue-100 text-blue-700 border-blue-300',
    C: 'bg-amber-100 text-amber-700 border-amber-300',
    D: 'bg-orange-100 text-orange-700 border-orange-300',
    F: 'bg-red-100 text-red-700 border-red-300',
    'N/A': 'bg-slate-100 text-slate-500 border-slate-200',
  };
  return (
    <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl border-2 font-bold ${colors[grade] || colors['N/A']}`}>
      <span className="text-xl leading-none">{grade}</span>
      <span className="text-xs font-normal mt-0.5">{score}/100</span>
    </div>
  );
}

// ── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 85 ? 'bg-emerald-500' :
    score >= 70 ? 'bg-blue-500' :
    score >= 50 ? 'bg-amber-500' :
    score >= 30 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-medium text-slate-600 w-8 text-right">{score}%</span>
    </div>
  );
}

// ── Stat mini card ────────────────────────────────────────────────────────────
function MiniStat({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: any; color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  );
}

// ── Ticket row ────────────────────────────────────────────────────────────────
function TicketRow({ ticket }: { ticket: any }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 truncate font-medium">{ticket.title}</p>
        <p className="text-xs text-slate-400">{formatDate(ticket.createdAt)}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {ticket.hoursWorked > 0 && (
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />{ticket.hoursWorked}h
          </span>
        )}
        <PriorityBadge priority={ticket.priority} />
        <StatusBadge status={ticket.status} />
      </div>
    </div>
  );
}

// ── Technicien card ───────────────────────────────────────────────────────────
function TechnicienCard({ tech, rank }: { tech: any; rank: number }) {
  const [expanded, setExpanded] = useState(false);

  const rankColors: Record<number, string> = {
    1: 'text-yellow-500',
    2: 'text-slate-400',
    3: 'text-amber-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header card */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Rank */}
          <div className="flex flex-col items-center flex-shrink-0 pt-1">
            <span className={`text-lg font-bold ${rankColors[rank] || 'text-slate-300'}`}>
              #{rank}
            </span>
            {rank <= 3 && <Star className={`w-4 h-4 ${rankColors[rank]}`} fill="currentColor" />}
          </div>

          {/* Avatar + nom */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
              tech.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
            }`}>
              {tech.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-800 truncate">{tech.name}</p>
                {!tech.isActive && (
                  <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Inactif</span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">{tech.email}</p>
            </div>
          </div>

          {/* Grade */}
          <GradeBadge grade={tech.grade} score={tech.score} />
        </div>

        {/* Score bar */}
        <div className="mt-4 mb-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Score de rendement</span>
            <span className="font-medium">{tech.resolutionRate}% résolution</span>
          </div>
          <ScoreBar score={tech.score} />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MiniStat label="Tickets assignés" value={tech.totalAssigned}
            icon={Wrench} color="bg-blue-50 text-blue-600" />
          <MiniStat label="En cours" value={tech.enCours}
            icon={Clock} color="bg-amber-50 text-amber-600" />
          <MiniStat label="Résolus" value={tech.resolus + tech.clotures}
            icon={CheckCircle2} color="bg-emerald-50 text-emerald-600" />
          <MiniStat label="Heures totales" value={`${tech.totalHoursWorked}h`}
            icon={TrendingUp} color="bg-violet-50 text-violet-600" />
          <MiniStat label="Moy. par ticket" value={`${tech.avgHoursPerTicket}h`}
            icon={BarChart3} color="bg-slate-100 text-slate-600" />
          <MiniStat label="Urgents résolus" value={tech.urgentsResolus}
            icon={AlertTriangle} color="bg-red-50 text-red-600" />
        </div>
      </div>

      {/* Toggle tickets */}
      {tech.tickets.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 border-t border-slate-100 text-sm text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <span className="font-medium">
              Voir les {tech.tickets.length} ticket(s)
            </span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expanded && (
            <div className="px-5 py-3 border-t border-slate-100 max-h-72 overflow-y-auto">
              {tech.tickets.map((t: any) => (
                <TicketRow key={t.id} ticket={t} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function TechniciensRendementPage() {
  const [sortBy, setSortBy] = useState<'score' | 'totalAssigned' | 'resolus' | 'heures'>('score');

  const { data: techniciens = [], isLoading } = useQuery({
    queryKey: ['techniciens-rendement'],
    queryFn: fetchRendement,
    refetchInterval: 60_000,
  });

  const sorted = [...techniciens].sort((a: any, b: any) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'totalAssigned') return b.totalAssigned - a.totalAssigned;
    if (sortBy === 'resolus') return (b.resolus + b.clotures) - (a.resolus + a.clotures);
    if (sortBy === 'heures') return b.totalHoursWorked - a.totalHoursWorked;
    return 0;
  });

  // Totaux globaux
  const totaux = techniciens.reduce((acc: any, t: any) => ({
    totalAssigned: acc.totalAssigned + t.totalAssigned,
    resolus: acc.resolus + t.resolus + t.clotures,
    enCours: acc.enCours + t.enCours,
    heures: acc.heures + t.totalHoursWorked,
  }), { totalAssigned: 0, resolus: 0, enCours: 0, heures: 0 });

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Rendement des techniciens"
        subtitle="Performance et suivi par technicien"
      />

      <div className="flex-1 p-6 overflow-y-auto">

        {/* KPIs globaux */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Techniciens actifs', value: techniciens.filter((t: any) => t.isActive).length, icon: Users, color: 'text-blue-700', bg: 'bg-blue-50' },
            { label: 'Tickets assignés', value: totaux.totalAssigned, icon: Wrench, color: 'text-violet-700', bg: 'bg-violet-50' },
            { label: 'Tickets résolus', value: totaux.resolus, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'Heures travaillées', value: `${Math.round(totaux.heures)}h`, icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
              <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
                <p className="text-sm text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Légende grades */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Système de notation automatique
          </p>
          <div className="flex flex-wrap gap-3 text-xs">
            {[
              { grade: 'A', range: '85-100', desc: 'Excellent', color: 'bg-emerald-100 text-emerald-700' },
              { grade: 'B', range: '70-84', desc: 'Bien', color: 'bg-blue-100 text-blue-700' },
              { grade: 'C', range: '50-69', desc: 'Moyen', color: 'bg-amber-100 text-amber-700' },
              { grade: 'D', range: '30-49', desc: 'Insuffisant', color: 'bg-orange-100 text-orange-700' },
              { grade: 'F', range: '0-29', desc: 'Mauvais', color: 'bg-red-100 text-red-700' },
            ].map(({ grade, range, desc, color }) => (
              <div key={grade} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${color}`}>
                <span className="font-bold text-base">{grade}</span>
                <span>{range} pts — {desc}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Score = 60% taux de résolution + 20% urgents résolus + 20% efficacité (heures/ticket)
          </p>
        </div>

        {/* Tri */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-sm text-slate-500">Trier par :</span>
          {[
            { value: 'score', label: 'Score' },
            { value: 'totalAssigned', label: 'Tickets assignés' },
            { value: 'resolus', label: 'Tickets résolus' },
            { value: 'heures', label: 'Heures travaillées' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSortBy(value as any)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                sortBy === value
                  ? 'bg-blue-700 text-white'
                  : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Cards techniciens */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 text-slate-200" />
            <p className="font-medium">Aucun technicien trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sorted.map((tech: any, index: number) => (
              <TechnicienCard key={tech.id} tech={tech} rank={index + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
