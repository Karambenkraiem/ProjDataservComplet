'use client';
import { useForm } from 'react-hook-form';
import { X, CheckCircle } from 'lucide-react';

type CloseFormData = {
  description: string;
  resolution?: string;
  hoursWorked: number;
  travelMinutes: number;
};

interface Props {
  ticketTitle: string;
  onClose: () => void;
  onConfirm: (data: CloseFormData) => void;
  isLoading?: boolean;
}

export function CloseInterventionModal({ ticketTitle, onClose, onConfirm, isLoading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<CloseFormData>({
    defaultValues: { hoursWorked: 0, travelMinutes: 0 },
  });

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-slate-800">Clôturer l'intervention</h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{ticketTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info banner */}
        <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-700">
            Un PDF sera généré automatiquement et le ticket passera en statut <strong>Résolu</strong>.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onConfirm)} className="p-6 space-y-4">

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description de l'intervention *
            </label>
            <textarea
              {...register('description', { required: 'Description requise' })}
              rows={3}
              placeholder="Décrivez les actions effectuées…"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none transition"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Résolution / Remarques
            </label>
            <textarea
              {...register('resolution')}
              rows={2}
              placeholder="Solution apportée, recommandations…"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Heures travaillées *
              </label>
              <div className="relative">
                <input
                  {...register('hoursWorked', {
                    required: 'Requis',
                    min: { value: 0, message: '≥ 0' },
                    valueAsNumber: true,
                  })}
                  type="number"
                  step="0.5"
                  min="0"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none pr-8"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">h</span>
              </div>
              {errors.hoursWorked && (
                <p className="mt-1 text-xs text-red-600">{errors.hoursWorked.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Déplacement *
              </label>
              <div className="relative">
                <input
                  {...register('travelMinutes', {
                    required: 'Requis',
                    min: { value: 0, message: '≥ 0' },
                    valueAsNumber: true,
                  })}
                  type="number"
                  min="0"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none pr-12"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">min</span>
              </div>
              {errors.travelMinutes && (
                <p className="mt-1 text-xs text-red-600">{errors.travelMinutes.message}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-lg text-sm hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isLoading ? 'Clôture…' : 'Confirmer la clôture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
