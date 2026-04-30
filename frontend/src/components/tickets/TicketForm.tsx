'use client';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';

type TicketFormData = {
  title: string;
  description: string;
  type: 'SUR_SITE' | 'DISTANCE';
  priority: 'NORMAL' | 'URGENT';
  clientId: string;
  technicienId?: string;
};

interface Client { id: string; companyName: string; }
interface User   { id: string; name: string; assignedTickets?: any[]; }

interface Props {
  onSubmit: (data: TicketFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  clients?: Client[];
  techniciens?: User[];
  showClientSelect?: boolean;
  defaultClientId?: string;
}

export function TicketForm({
  onSubmit,
  onCancel,
  isLoading,
  clients = [],
  techniciens = [],
  showClientSelect = true,
  defaultClientId,
}: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<TicketFormData>({
    defaultValues: {
      type: 'SUR_SITE',
      priority: 'NORMAL',
      clientId: defaultClientId || '',
    },
  });

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="font-semibold text-slate-800">Nouveau ticket d'intervention</h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto flex-1">

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Titre *</label>
            <input
              {...register('title', { required: 'Titre requis' })}
              placeholder="Ex: Panne serveur de messagerie"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
            <textarea
              {...register('description', { required: 'Description requise' })}
              rows={3}
              placeholder="Décrivez le problème en détail…"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none transition"
            />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          </div>

          {/* Type + Priorité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
              <select
                {...register('type', { required: true })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="SUR_SITE">🏢 Sur site</option>
                <option value="DISTANCE">💻 À distance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priorité</label>
              <select
                {...register('priority')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="NORMAL">🟢 Normal</option>
                <option value="URGENT">🔴 Urgent</option>
              </select>
            </div>
          </div>

          {/* Client */}
          {showClientSelect && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Client *</label>
              <select
                {...register('clientId', { required: 'Client requis' })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Sélectionner un client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.companyName}</option>
                ))}
              </select>
              {errors.clientId && <p className="mt-1 text-xs text-red-600">{errors.clientId.message}</p>}
            </div>
          )}

          {/* Technicien */}
          {techniciens.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Assigner à un technicien
              </label>
              <select
                {...register('technicienId')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Non assigné pour l'instant</option>
                {techniciens.map((t) => {
                  const active = t.assignedTickets?.filter(
                    (tk: any) => ['NOUVEAU', 'EN_COURS'].includes(tk.status)
                  ).length ?? 0;
                  return (
                    <option key={t.id} value={t.id}>
                      {t.name} ({active} ticket{active !== 1 ? 's' : ''} actif{active !== 1 ? 's' : ''})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-lg text-sm hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isLoading ? 'Création…' : 'Créer le ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
