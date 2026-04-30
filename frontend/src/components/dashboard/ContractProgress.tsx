import { Client } from '@/types';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface Props {
  clients: Client[];
}

export function ContractProgress({ clients }: Props) {
  if (!clients || clients.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800 text-sm">Contrats heures</h2>
        <p className="text-xs text-slate-400 mt-0.5">Consommation par client contractuel</p>
      </div>

      <div className="divide-y divide-slate-100">
        {clients.map((client: any) => {
          const pct = client.contractHours
            ? Math.min(100, Math.round((client.usedHours / client.contractHours) * 100))
            : 0;

          const barColor =
            pct >= 90 ? 'bg-red-500' :
            pct >= 70 ? 'bg-amber-500' :
            'bg-emerald-500';

          const remaining = client.contractHours
            ? Math.max(0, client.contractHours - client.usedHours)
            : null;

          return (
            <Link key={client.id} href={`/manager/clients/${client.id}`}>
              <div className="px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-medium text-slate-700 truncate flex-1 mr-2">
                    {client.companyName}
                  </p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {pct >= 90
                      ? <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    }
                    <span className="text-xs font-medium text-slate-500">
                      {client.usedHours}h / {client.contractHours}h
                    </span>
                  </div>
                </div>

                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-slate-400">
                  <span>{pct}% utilisé</span>
                  {remaining !== null && (
                    <span className={pct >= 90 ? 'text-red-500 font-medium' : ''}>
                      {remaining}h restantes
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
