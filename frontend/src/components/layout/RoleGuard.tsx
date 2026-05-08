'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Role } from '@/types';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

export function RoleGuard({ children, roles }: { children: React.ReactNode; roles: Role[] }) {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) { router.replace('/auth/login'); return; }
    if (user && !roles.includes(user.role)) { router.replace('/'); }
  }, [_hasHydrated, isAuthenticated, user, roles, router]);

  if (!_hasHydrated) return <Spinner />;
  if (!isAuthenticated || !user || !roles.includes(user.role)) return <Spinner />;

  return <>{children}</>;
}
