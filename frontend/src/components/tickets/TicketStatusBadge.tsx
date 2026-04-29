import { TicketStatus, Priority } from '@/types';
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', STATUS_COLORS[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', PRIORITY_COLORS[priority])}>
      {priority === 'URGENT' && <span className="mr-1">🔴</span>}
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
