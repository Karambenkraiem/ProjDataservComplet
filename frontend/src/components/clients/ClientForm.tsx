'use client';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';

type ClientFormData = {
  name: string;
  companyName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  travelTimeMinutes?: number;
  isContractual?: boolean;
  contractHours?: number;
};

interface Props {
  onSubmit: (data: ClientFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  defaultValues?: Partial<ClientFormData>;
  mode?: 'create' | 'edit';
}

export function ClientForm({ onSubmit, onCancel, isLoading, defaultValues, mode = 'create' }: Props) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ClientFormData>({
    defaultValues: {
      isContractual: false,
      travelTimeMinutes: 0,
      ...defaultValues,
    },
  });

  const isContractual = watch('isContractual');

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="font-semibold text-slate-800">
            {mode === 'edit' ? 'Modifier le client' : 'Nouveau client'}
          </h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto flex-1">

          {/* Nom + Société */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet *</label>
              <input
                {...register('name', { required: 'Requis' })}
                placeholder="Mohamed Ben Ali"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Société *</label>
              <input
                {...register('companyName', { required: 'Requis' })}
                placeholder="Alpha Corp SARL"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
              {errors.companyName && <p className="mt-1 text-xs text-red-600">{errors.companyName.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
            <input
              {...register('email', { required: 'Requis' })}
              type="email"
              placeholder="contact@societe.tn"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          {/* Mot de passe + Téléphone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mot de passe {mode === 'edit' ? '' : '*'}
              </label>
              <input
                {...register('password', {
                  required: mode === 'create' ? 'Requis' : false,
                  minLength: { value: 8, message: 'Min 8 caractères' },
                })}
                type="password"
                placeholder="••••••••"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
              <input
                {...register('phone')}
                placeholder="+216 XX XXX XXX"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
            <input
              {...register('address')}
              placeholder="12 Rue de la République, Tunis"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Temps déplacement */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Temps de déplacement (min)
            </label>
            <input
              {...register('travelTimeMinutes', { min: 0, valueAsNumber: true })}
              type="number"
              min="0"
              placeholder="30"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Contrat */}
          <div className="p-4 bg-slate-50 rounded-xl space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                {...register('isContractual')}
                type="checkbox"
                className="w-4 h-4 rounded text-blue-600 border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">Client sous contrat d'heures</span>
            </label>
            {isContractual && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Heures allouées / an *
                </label>
                <input
                  {...register('contractHours', {
                    required: isContractual ? 'Requis si sous contrat' : false,
                    min: { value: 1, message: '≥ 1' },
                    valueAsNumber: true,
                  })}
                  type="number"
                  min="1"
                  placeholder="200"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
                {errors.contractHours && (
                  <p className="mt-1 text-xs text-red-600">{errors.contractHours.message}</p>
                )}
              </div>
            )}
          </div>

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
              {isLoading
                ? 'Sauvegarde…'
                : mode === 'edit' ? 'Modifier' : 'Créer le client'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
