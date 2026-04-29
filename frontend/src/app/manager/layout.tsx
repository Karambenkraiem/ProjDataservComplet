import { Sidebar } from '@/components/layout/Sidebar';
import { RoleGuard } from '@/components/layout/RoleGuard';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard roles={['MANAGER']}>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </RoleGuard>
  );
}
