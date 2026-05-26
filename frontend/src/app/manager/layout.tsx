import { AppShell } from '@/components/layout/AppShell';
import { RoleGuard } from '@/components/layout/RoleGuard';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard roles={['MANAGER']}>
      <AppShell>{children}</AppShell>
    </RoleGuard>
  );
}
