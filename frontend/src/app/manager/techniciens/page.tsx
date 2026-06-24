'use client';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import {
  Users, Clock, CheckCircle2, AlertTriangle, TrendingUp,
  ChevronUp, ChevronDown, ChevronsUpDown, BarChart3, Wrench,
} from 'lucide-react';

const fetchRendement = () => api.get('/techniciens/rendement').then((r) => r.data);

type SortField = 'createdAt' | 'score' | 'totalAssigned' | 'resolus' | 'heures' | 'enCours';
type SortDir = 'asc' | 'desc';

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
    <div className={`inline-flex flex-col items-center justify-center w-12 h-12 rounded-xl border-2 font-bold ${colors[grade] || colors['N/A']}`}>
      <span className="text-lg leading-none">{grade}</span>
      <span className="text-xs font-normal">{score}</span>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? 'bg-emerald-500' : score >= 70 ? 'bg-blue-500' : score >= 50 ? 'bg-amber-500' : score >= 30 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2 w-28">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-600 w-7 text-right">{score}%</span>
    </div>
  );
}

function SortTh({ label, field, sort, onSort }: {
  label: string; field: SortField;
  sort: { field: SortField; dir: SortDir };
  onSort: (f: SortField) => void;
}) {
  const active = sort.field === field;
  return (
    <th className="px-4 py-3 text-left">
      <button
        onClick={() => onSort(field)}
        className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wide transition-colors ${active ? 'text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}
      >
        {label}
        {active
          ? sort.dir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          : <ChevronsUpDown className="w-3 h-3 text-slate-300" />}
      </button>
    </th>
  );
}

export default function TechniciensRendementPage() {
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({ field: 'createdAt', dir: 'desc' });
  const [search, setSearch] = useState('');

  const { data: techniciens = [], isLoading } = useQuery({
    queryKey: ['techniciens-rendement'],
    queryFn: fetchRendement,
    refetchInterval: 60_000,
  });

  const toggleSort = (field: SortField) => {
    setSort(s => s.field === field ? { ...s, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { field, dir: 'desc' });
  };

  const displayed = useMemo(() => {
    let list = [...techniciens] as any[];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t => t.name?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      let av: any, bv: any;
      if (sort.field === 'createdAt') { av = new Date(a.createdAt ?? 0).getTime(); bv = new Date(b.createdAt ?? 0).getTime(); }
      else if (sort.field === 'score') { av = a.score; bv = b.score; }
      else if (sort.field === 'totalAssigned') { av = a.totalAssigned; bv = b.totalAssigned; }
      else if (sort.field === 'resolus') { av = (a.resolus ?? 0) + (a.clotures ?? 0); bv = (b.resolus ?? 0) + (b.clotures ?? 0); }
      else if (sort.field === 'heures') { av = a.totalHoursWorked; bv = b.totalHoursWorked; }
      else if (sort.field === 'enCours') { av = a.enCours; bv = b.enCours; }
      else { av = 0; bv = 0; }
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [techniciens, search, sort]);

  // Totaux globaux
  const totaux = techniciens.reduce((acc: any, t: any) => ({
    totalAssigned: acc.totalAssigned + t.totalAssigned,
    resolus: acc.resolus + t.resolus + t.clotures,
    enCours: acc.enCours + t.enCours,
    heures: acc.heures + t.totalHoursWorked,
  }), { totalAssigned: 0, resolus: 0, enCours: 0, heures: 0 });

  return (
    <div className="flex flex-col h-full">
      <Header title="Rendement des techniciens" subtitle={`${displayed.length} technicien(s)`} />

      <div className="flex-1 p-6 overflow-y-auto">

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Techniciens actifs', value: (techniciens as any[]).filter(t => t.isActive).length, icon: Users, color: 'text-blue-700', bg: 'bg-blue-50' },
            { label: 'Tickets assignés', value: totaux.totalAssigned, icon: Wrench, color: 'text-violet-700', bg: 'bg-violet-50' },
            { label: 'Tickets résolus', value: totaux.resolus, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'Heures travaillées', value: `${Math.round(totaux.heures)}h`, icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Légende grades */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Système de notation</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { grade: 'A', range: '85-100', color: 'bg-emerald-100 text-emerald-700' },
              { grade: 'B', range: '70-84', color: 'bg-blue-100 text-blue-700' },
              { grade: 'C', range: '50-69', color: 'bg-amber-100 text-amber-700' },
              { grade: 'D', range: '30-49', color: 'bg-orange-100 text-orange-700' },
              { grade: 'F', range: '0-29', color: 'bg-red-100 text-red-700' },
            ].map(({ grade, range, color }) => (
              <span key={grade} className={`px-2.5 py-1 rounded-lg font-semibold ${color}`}>{grade} — {range} pts</span>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">Score = 60% résolution + 20% urgents + 20% efficacité</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-4">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher technicien…"
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white w-52 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white border border-slate-200 rounded-lg h-14 animate-pulse" />)}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 text-slate-200" />
            <p className="font-medium">Aucun technicien</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
                  <SortTh label="Nom" field="createdAt" sort={sort} onSort={toggleSort} />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Grade</th>
                  <SortTh label="Score" field="score" sort={sort} onSort={toggleSort} />
                  <SortTh label="Assignés" field="totalAssigned" sort={sort} onSort={toggleSort} />
                  <SortTh label="En cours" field="enCours" sort={sort} onSort={toggleSort} />
                  <SortTh label="Résolus" field="resolus" sort={sort} onSort={toggleSort} />
                  <SortTh label="Heures" field="heures" sort={sort} onSort={toggleSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayed.map((tech: any, index: number) => {
                  const rankColors: Record<number, string> = { 0: 'text-yellow-500 font-bold', 1: 'text-slate-400 font-bold', 2: 'text-amber-600 font-bold' };
                  return (
                    <tr key={tech.id} className={`hover:bg-slate-50 transition-colors ${!tech.isActive ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        <span className={`text-sm ${rankColors[index] || 'text-slate-400'}`}>#{index + 1}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${tech.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                            {tech.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{tech.name}</p>
                            <p className="text-xs text-slate-400">{tech.email}</p>
                          </div>
                          {!tech.isActive && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Inactif</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3"><GradeBadge grade={tech.grade} score={tech.score} /></td>
                      <td className="px-4 py-3"><ScoreBar score={tech.score} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-violet-700">
                          <Wrench className="w-3.5 h-3.5" />
                          <span className="font-semibold">{tech.totalAssigned}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-amber-600">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="font-semibold">{tech.enCours}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="font-semibold">{(tech.resolus ?? 0) + (tech.clotures ?? 0)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-blue-600">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span className="font-semibold">{tech.totalHoursWorked}h</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
