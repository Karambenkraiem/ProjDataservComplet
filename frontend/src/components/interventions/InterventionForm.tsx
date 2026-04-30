'use client';
import { useForm } from 'react-hook-form';
import { Save, Clock, MapPin } from 'lucide-react';
import { Intervention } from '@/types';

type InterventionFormData = {
  description: string;
  resolution?: string;
  hoursWorked: number;
  travelMinutes: number;
};

interface Props {
  intervention?: Intervention;
  onSave: (data: InterventionFormData) => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

export function InterventionForm({ intervention, onSave, isLoading, readOnly = false }: Props) {
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<InterventionFormData>({
    defaultValues: {
      description: intervention?.description || '',
      resolution: intervention?.resolution || '',
      hoursWorked: intervention?.hoursWorked || 0,
      travelMinutes: intervention?.travelMinutes || 0,
    },
  });

  if (readOnly && intervention) {
    return (
      <div className="space-y-4">
        {/* Temps */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-blue-700" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Heures travaillées</p>
              <p className="font-bold text-slate-800 text-lg">{intervention.hoursWorked}h</p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-violet-700" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Déplacement</p>
              <p className="font-bold text-slate-800 text-lg">{intervention.travelMinutes} min</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {intervention.description && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Description</p>
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
              {intervention.description}
            </div>
          </div>
        )}

        {/* Résolution */}
        {intervention.resolution && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Résolution</p>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
              {intervention.resolution}
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs text-slate-400">
          {intervention.startedAt && (
            <div>
              <p className="font-medium text-slate-500 mb-0.5">Démarrée le</p>
              <p>{new Date(intervention.startedAt).toLocaleString('fr-TN')}</p>
            </div>
          )}
          {intervention.closedAt && (
            <div>
              <p className="font-medium text-slate-500 mb-0.5">Clôturée le</p>
              <p>{new Date(intervention.closedAt).toLocaleString('fr-TN')}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Description de l'intervention *
        </label>
        <textarea
          {...register('description', { required: 'Description requise' })}
          rows={4}
          placeholder="Décrivez les actions effectuées, les problèmes rencontrés…"
          className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none transition"
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
          rows={3}
          placeholder="Solution apportée, recommandations pour le client…"
          className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none transition"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Heures travaillées
          </label>
          <div className="relative">
            <input
              {...register('hoursWorked', { min: 0, valueAsNumber: true })}
              type="number"
              step="0.5"
              min="0"
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none pr-8"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">h</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Déplacement
          </label>
          <div className="relative">
            <input
              {...register('travelMinutes', { min: 0, valueAsNumber: true })}
              type="number"
              min="0"
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none pr-12"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">min</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !isDirty}
        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-medium hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading
          ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <Save className="w-4 h-4" />
        }
        {isLoading ? 'Sauvegarde…' : 'Sauvegarder la fiche'}
      </button>
    </form>
  );
}
