'use client';
import { TicketStatus, Priority } from '@/types';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/lib/utils';
import { Filter, X } from 'lucide-react';

interface Filters {
  status: TicketStatus | '';
  priority: Priority | '';
  type: 'SUR_SITE' | 'DISTANCE' | '';
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  showTypeFilter?: boolean;
}

const STATUSES: Array<{ value: TicketStatus | ''; label: string }> = [
  { value: '', label: 'Tous les statuts' },
  { value: 'NOUVEAU', label: STATUS_LABELS.NOUVEAU },
  { value: 'EN_COURS', label: STATUS_LABELS.EN_COURS },
  { value: 'RESOLU', label: STATUS_LABELS.RESOLU },
  { value: 'CLOTURE', label: STATUS_LABELS.CLOTURE },
];

const PRIORITIES: Array<{ value: Priority | ''; label: string }> = [
  { value: '', label: 'Toutes priorités' },
  { value: 'NORMAL', label: PRIORITY_LABELS.NORMAL },
  { value: 'URGENT', label: PRIORITY_LABELS.URGENT },
];

const TYPES: Array<{ value: 'SUR_SITE' | 'DISTANCE' | ''; label: string }> = [
  { value: '', label: 'Tous les types' },
  { value: 'SUR_SITE', label: 'Sur site' },
  { value: 'DISTANCE', label: 'À distance' },
];

export function TicketFilters({ filters, onChange, showTypeFilter = true }: Props) {
  const hasActiveFilters = filters.status || filters.priority || filters.type;

  const reset = () => onChange({ status: '', priority: '', type: '' });

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 text-slate-400">
        <Filter className="w-4 h-4" />
        <span className="text-sm hidden sm:block">Filtres</span>
      </div>

      {/* Statut */}
      <select
        value={filters.status}
        onChange={e => onChange({ ...filters, status: e.target.value as TicketStatus | '' })}
        className={`border rounded-lg px-3 py-2 text-sm bg-white transition-colors ${
          filters.status
            ? 'border-blue-400 text-blue-700 font-medium'
            : 'border-slate-300 text-slate-700'
        }`}
      >
        {STATUSES.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      {/* Priorité */}
      <select
        value={filters.priority}
        onChange={e => onChange({ ...filters, priority: e.target.value as Priority | '' })}
        className={`border rounded-lg px-3 py-2 text-sm bg-white transition-colors ${
          filters.priority
            ? 'border-blue-400 text-blue-700 font-medium'
            : 'border-slate-300 text-slate-700'
        }`}
      >
        {PRIORITIES.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      {/* Type */}
      {showTypeFilter && (
        <select
          value={filters.type}
          onChange={e => onChange({ ...filters, type: e.target.value as 'SUR_SITE' | 'DISTANCE' | '' })}
          className={`border rounded-lg px-3 py-2 text-sm bg-white transition-colors ${
            filters.type
              ? 'border-blue-400 text-blue-700 font-medium'
              : 'border-slate-300 text-slate-700'
          }`}
        >
          {TYPES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      )}

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Réinitialiser
        </button>
      )}

      {/* Compteur filtres actifs */}
      {hasActiveFilters && (
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
          {[filters.status, filters.priority, filters.type].filter(Boolean).length} filtre(s) actif(s)
        </span>
      )}
    </div>
  );
}
