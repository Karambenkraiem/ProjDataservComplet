import Link from 'next/link';
import { Ticket } from '@/types';
import { StatusBadge, PriorityBadge } from './TicketStatusBadge';
import { formatDate, TYPE_LABELS } from '@/lib/utils';
import { MapPin, Monitor, User, Clock } from 'lucide-react';

interface Props { ticket: Ticket; basePath: string }

export function TicketCard({ ticket, basePath }: Props) {
  return (
    <Link href={`${basePath}/${ticket.id}`}>
      <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-slate-400 mb-0.5">#{ticket.id.slice(0, 8).toUpperCase()}</p>
            <h3 className="font-semibold text-slate-800 text-sm leading-snug truncate">{ticket.title}</h3>
          </div>
          <PriorityBadge priority={ticket.priority} />
        </div>

        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{ticket.description}</p>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <StatusBadge status={ticket.status} />
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            {ticket.type === 'SUR_SITE' ? <MapPin className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
            {TYPE_LABELS[ticket.type]}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {ticket.technicien?.name ?? 'Non assigné'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(ticket.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
