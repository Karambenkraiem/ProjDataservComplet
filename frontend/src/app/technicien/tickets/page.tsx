'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { TicketCard } from '@/components/tickets/TicketCard';
import { TicketStatus } from '@/types';

const STATUSES: { value: TicketStatus | ''; label: string }[] = [
  { value: '', label: 'Tous' },
  { value: 'NOUVEAU', label: 'Nouveaux' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'RESOLU', label: 'Résolus' },
];

export default function TechnicienTicketsPage() {
  const [status, setStatus] = useState<TicketStatus | ''>('');

  const params: Record<string, string> = {};
  if (status) params.status = status;

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets', params],
    queryFn: () => ticketsApi.list(params),
  });

  return (
    <div className="flex flex-col h-full">
      <Header title="Mes tickets" subtitle={`${tickets.length} ticket(s) assigné(s)`} />
      <div className="flex-1 p-6 overflow-y-auto">

        {/* Filtres statut */}
        <div className="flex gap-2 mb-6">
          {STATUSES.map(({ value, label }) => (
            <button key={value} onClick={() => setStatus(value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === value
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl h-40 animate-pulse" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg font-medium mb-1">Aucun ticket</p>
            <p className="text-sm">Pas de ticket correspondant à ce filtre</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tickets.map((t: any) => (
              <TicketCard key={t.id} ticket={t} basePath="/technicien/tickets" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
