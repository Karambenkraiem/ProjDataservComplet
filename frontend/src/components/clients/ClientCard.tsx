import Link from 'next/link';
import { Client } from '@/types';
import { Building2, Mail, Phone, Clock, Ticket } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Props {
  client: Client;
  basePath?: string;
}

export function ClientCard({ client, basePath = '/manager/clients' }: Props) {
  const contractPct = client.contractHours
    ? Math.min(100, Math.round((client.usedHours / client.contractHours) * 100))
    : 0;

  const barColor =
    contractPct >= 90 ? 'bg-red-500' :
    contractPct >= 70 ? 'bg-amber-500' :
    'bg-emerald-500';

  return (
    <Link href={`${basePath}/${client.id}`}>
      <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer h-full">

        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-blue-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 truncate">{client.companyName}</p>
            <p className="text-xs text-slate-500 truncate">{client.user?.name}</p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
            client.isContractual
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-500'
          }`}>
            {client.isContractual ? 'Contrat' : 'Hors contrat'}
          </span>
        </div>

        {/* Infos contact */}
        <div className="space-y-1.5 mb-4">
          {client.user?.email && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{client.user.email}</span>
            </div>
          )}
          {client.user?.phone && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{client.user.phone}</span>
            </div>
          )}
          {client.travelTimeMinutes > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Déplacement : {client.travelTimeMinutes} min</span>
            </div>
          )}
        </div>

        {/* Barre contrat */}
        {client.isContractual && client.contractHours && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Heures contrat</span>
              <span className="font-medium">{client.usedHours}h / {client.contractHours}h</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${contractPct}%` }}
              />
            </div>
            {contractPct >= 90 && (
              <p className="text-xs text-red-600 mt-1 font-medium">⚠ Quota presque atteint</p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Ticket className="w-3 h-3" />
            {client.tickets?.length ?? 0} ticket(s)
          </span>
          <span>Depuis {formatDate(client.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
