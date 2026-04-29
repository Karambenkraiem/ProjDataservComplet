'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { usersApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { formatDate } from '@/lib/utils';
import {
  Plus, X, User, Mail, Phone, Wrench,
  CheckCircle2, XCircle, Pencil, Trash2,
} from 'lucide-react';

export default function ManagerUsersPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: techniciens = [], isLoading } = useQuery({
    queryKey: ['users', 'TECHNICIEN'],
    queryFn: () => usersApi.list('TECHNICIEN'),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const createMutation = useMutation({
    mutationFn: (data: any) => usersApi.create({ ...data, role: 'TECHNICIEN' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['techniciens'] });
      closeForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => usersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['techniciens'] });
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['techniciens'] });
      setConfirmDelete(null);
    },
  });

  const openEdit = (user: any) => {
    setEditingUser(user);
    setValue('name', user.name);
    setValue('email', user.email);
    setValue('phone', user.phone || '');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingUser(null);
    reset();
  };

  const onSubmit = (data: any) => {
    if (!data.password) delete data.password;
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col h-full">
      <Header title="Techniciens" subtitle={`${techniciens.length} technicien(s)`} />

      <div className="flex-1 p-6 overflow-y-auto">

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nouveau technicien
          </button>
        </div>

        {/* Modal créer / modifier */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">
                  {editingUser ? 'Modifier le technicien' : 'Nouveau technicien'}
                </h2>
                <button onClick={closeForm}>
                  <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet *</label>
                  <input
                    {...register('name', { required: 'Nom requis' })}
                    placeholder="Ex: Karim Mansour"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{String(errors.name.message)}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input
                    {...register('email', { required: 'Email requis' })}
                    type="email"
                    placeholder="tech@dataserv.tn"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{String(errors.email.message)}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mot de passe {editingUser ? '(laisser vide pour ne pas changer)' : '*'}
                  </label>
                  <input
                    {...register('password', { required: editingUser ? false : 'Mot de passe requis', minLength: { value: 8, message: 'Minimum 8 caractères' } })}
                    type="password"
                    placeholder="••••••••"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {errors.password && <p className="mt-1 text-xs text-red-600">{String(errors.password.message)}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                  <input
                    {...register('phone')}
                    placeholder="+216 XX XXX XXX"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors disabled:opacity-60"
                  >
                    {isPending ? 'Sauvegarde…' : editingUser ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal confirmation suppression */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Désactiver le compte ?</h3>
                  <p className="text-sm text-slate-500">Le technicien ne pourra plus se connecter.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg text-sm hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => deleteMutation.mutate(confirmDelete)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
                >
                  {deleteMutation.isPending ? 'Suppression…' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste techniciens */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl h-36 animate-pulse" />
            ))}
          </div>
        ) : techniciens.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Wrench className="w-10 h-10 mx-auto mb-2 text-slate-200" />
            <p className="font-medium">Aucun technicien</p>
            <p className="text-sm mt-1">Ajoutez votre premier technicien</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {techniciens.map((tech: any) => (
              <div
                key={tech.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow"
              >
                {/* Header card */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {tech.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{tech.name}</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        tech.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {tech.isActive
                          ? <><CheckCircle2 className="w-3 h-3" /> Actif</>
                          : <><XCircle className="w-3 h-3" /> Inactif</>
                        }
                      </span>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(tech)}
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(tech.id)}
                      className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors"
                      title="Désactiver"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Infos */}
                <div className="space-y-1.5 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{tech.email}</span>
                  </div>
                  {tech.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{tech.phone}</span>
                    </div>
                  )}
                </div>

                {/* Tickets actifs */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Membre depuis {formatDate(tech.createdAt)}</span>
                  {tech.assignedTickets && (
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      <Wrench className="w-3 h-3" />
                      {tech.assignedTickets.filter((t: any) =>
                        ['NOUVEAU', 'EN_COURS'].includes(t.status)
                      ).length} ticket(s) actif(s)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
