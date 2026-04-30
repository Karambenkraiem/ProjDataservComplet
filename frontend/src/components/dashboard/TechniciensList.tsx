import { User } from '@/types';
import { Wrench, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface TechnicienWithStats extends User {
  activeTickets: number;
  urgentTickets: number;
  assignedTickets?: any[];
}

interface Props {
  techniciens: TechnicienWithStats[];
}

export function TechniciensList({ techniciens }: Props) {
  if (!techniciens || techniciens.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800 text-sm">Disponibilité techniciens</h2>
        <p className="text-xs text-slate-400 mt-0.5">{techniciens.length} technicien(s) actif(s)</p>
      </div>

      <div className="divide-y divide-slate-100">
        {techniciens.map((tech) => {
          const isAvailable = tech.activeTickets === 0;
          const isBusy = tech.activeTickets >= 3;

          return (
            <div key={tech.id} className="flex items-center gap-3 px-5 py-3.5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-semibold text-sm">
                  {tech.name.charAt(0).toUpperCase()}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                  isAvailable ? 'bg-emerald-400' :
                  isBusy ? 'bg-red-400' :
                  'bg-amber-400'
                }`} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{tech.name}</p>
                <p className="text-xs text-slate-400 truncate">{tech.email}</p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {tech.urgentTickets > 0 && (
                  <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                    <AlertTriangle className="w-3 h-3" />
                    {tech.urgentTickets}
                  </span>
                )}
                <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                  isAvailable
                    ? 'bg-emerald-100 text-emerald-700'
                    : isBusy
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  <Wrench className="w-3 h-3" />
                  {tech.activeTickets} ticket{tech.activeTickets !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Légende */}
      <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" /> Occupé
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400" /> Surchargé
        </span>
      </div>
    </div>
  );
}
