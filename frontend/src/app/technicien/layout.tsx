import { AppShell } from '@/components/layout/AppShell';
import { RoleGuard } from '@/components/layout/RoleGuard';

export default function TechnicienLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard roles={['TECHNICIEN']}>
      <AppShell>{children}</AppShell>
    </RoleGuard>
  );
}
