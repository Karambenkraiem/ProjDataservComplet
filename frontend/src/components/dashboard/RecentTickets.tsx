import Link from 'next/link';
import { Ticket } from '@/types';
import { StatusBadge, PriorityBadge } from '@/components/tickets/TicketStatusBadge';
import { formatDate } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface Props {
  tickets: Ticket[];
  basePath?: string;
  showAll?: string;
}

export function RecentTickets({ tickets, basePath = '/manager/tickets', showAll }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="font-semibold text-slate-800 text-sm">Tickets récents</h2>
          <p className="text-xs text-slate-400 mt-0.5">{tickets.length} ticket(s)</p>
        </div>
        {showAll && (
          <Link
            href={showAll}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Voir tout <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {tickets.length === 0 ? (
        <div className="py-10 text-center text-slate-400">
          <p className="text-sm">Aucun ticket récent</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {tickets.map((ticket: any) => (
            <Link key={ticket.id} href={`${basePath}/${ticket.id}`}>
              <div className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer">

                {/* Priorité indicator */}
                <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${
                  ticket.priority === 'URGENT' ? 'bg-red-400' : 'bg-slate-200'
                }`} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{ticket.title}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {ticket.client?.companyName} · {formatDate(ticket.createdAt)}
                  </p>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
