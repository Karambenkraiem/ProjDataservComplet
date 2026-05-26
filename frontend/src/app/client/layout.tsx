import { AppShell } from '@/components/layout/AppShell';
import { RoleGuard } from '@/components/layout/RoleGuard';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard roles={['CLIENT']}>
      <AppShell>{children}</AppShell>
    </RoleGuard>
  );
}
