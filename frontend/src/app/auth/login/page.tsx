'use client';
import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe requis'),
});
type FormData = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('disabled') === '1') setDisabled(true);
  }, [searchParams]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const quickLogin = (email: string) => {
    setValue('email', email);
    setValue('password', 'Password123!');
    handleSubmit(onSubmit)();
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    setDisabled(false);
    try {
      const res = await authApi.login(data.email, data.password);
      setAuth(res.user, res.accessToken);
      if (res.user.role === 'MANAGER') router.push('/manager/dashboard');
      else if (res.user.role === 'TECHNICIEN') router.push('/technicien/dashboard');
      else router.push('/client/tickets');
    } catch (e: any) {
      const msg: string = e.response?.data?.message || 'Identifiants incorrects';
      if (msg.includes('désactivé') || msg.includes('desactive')) {
        setDisabled(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <h2 className="text-xl font-semibold text-slate-800 mb-6">Connexion</h2>

      {disabled && (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm font-semibold text-orange-800 mb-1">Compte désactivé ou supprimé</p>
          <p className="text-sm text-orange-700">
            Votre compte a été désactivé ou supprimé. Veuillez contacter{' '}
            <span className="font-semibold">DataServ</span> pour plus d&apos;informations.
          </p>
        </div>
      )}

      {error && !disabled && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            {...register('email')}
            type="email"
            placeholder="votre@email.com"
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
          <input
            {...register('password')}
            type="password"
            placeholder="••••••••"
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
        >
          {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100">
        <p className="text-xs text-slate-400 text-center mb-3">Connexion rapide — démo</p>
        <div className="space-y-2">
          {/* Manager */}
          <button
            type="button"
            onClick={() => quickLogin('manager@dataserv.tn')}
            className="w-full flex items-center gap-3 py-2 px-3 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <span className="text-base">👔</span>
            <div className="text-left">
              <div className="text-xs font-semibold text-blue-700">Manager — Aymen Amri</div>
              <div className="text-xs text-blue-400 font-mono">manager@dataserv.tn</div>
            </div>
          </button>
          {/* Techniciens */}
          <button
            type="button"
            onClick={() => quickLogin('karam@dataserv.tn')}
            className="w-full flex items-center gap-3 py-2 px-3 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
          >
            <span className="text-base">🔧</span>
            <div className="text-left">
              <div className="text-xs font-semibold text-green-700">Technicien — Karam Ben Kraiem</div>
              <div className="text-xs text-green-400 font-mono">karam@dataserv.tn</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => quickLogin('khaireddine@dataserv.tn')}
            className="w-full flex items-center gap-3 py-2 px-3 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
          >
            <span className="text-base">🔧</span>
            <div className="text-left">
              <div className="text-xs font-semibold text-green-700">Technicien — Khaireddine Mhamdi</div>
              <div className="text-xs text-green-400 font-mono">khaireddine@dataserv.tn</div>
            </div>
          </button>
          {/* Clients */}
          <button
            type="button"
            onClick={() => quickLogin('contact@polinagroup.tn')}
            className="w-full flex items-center gap-3 py-2 px-3 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors"
          >
            <span className="text-base">🏢</span>
            <div className="text-left">
              <div className="text-xs font-semibold text-purple-700">Client — Polina Group</div>
              <div className="text-xs text-purple-400 font-mono">contact@polinagroup.tn</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => quickLogin('contact@delice.tn')}
            className="w-full flex items-center gap-3 py-2 px-3 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors"
          >
            <span className="text-base">🏭</span>
            <div className="text-left">
              <div className="text-xs font-semibold text-purple-700">Client — Delice Holding</div>
              <div className="text-xs text-purple-400 font-mono">contact@delice.tn</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <svg className="w-9 h-9 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">DataServ</h1>
          <p className="text-blue-200 mt-1 text-sm">Gestion du service technique</p>
        </div>

        <Suspense fallback={<div className="bg-white rounded-2xl shadow-2xl p-8 animate-pulse h-64" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
