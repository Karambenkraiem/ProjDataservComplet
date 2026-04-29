'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Ticket, Users, Building2, BarChart3,
  Settings, LogOut, Wrench, FileText,
} from 'lucide-react';

interface NavItem { href: string; label: string; icon: React.ElementType }

const MANAGER_NAV: NavItem[] = [
  { href: '/manager/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/manager/tickets', label: 'Tickets', icon: Ticket },
  { href: '/manager/clients', label: 'Clients', icon: Building2 },
  { href: '/manager/users', label: 'Techniciens', icon: Users },
  { href: '/manager/rapports', label: 'Rapports', icon: BarChart3 },
];

const TECH_NAV: NavItem[] = [
  { href: '/technicien/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/technicien/tickets', label: 'Mes tickets', icon: Ticket },
];

const CLIENT_NAV: NavItem[] = [
  { href: '/client/tickets', label: 'Mes tickets', icon: Ticket },
  { href: '/client/rapports', label: 'Mes rapports', icon: FileText },
];

const ROLE_NAV = { MANAGER: MANAGER_NAV, TECHNICIEN: TECH_NAV, CLIENT: CLIENT_NAV };
const ROLE_COLORS = {
  MANAGER: 'from-blue-950 to-blue-800',
  TECHNICIEN: 'from-emerald-900 to-emerald-700',
  CLIENT: 'from-violet-900 to-violet-700',
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const nav = ROLE_NAV[user?.role || 'CLIENT'];
  const gradient = ROLE_COLORS[user?.role || 'CLIENT'];

  const handleLogout = () => { logout(); router.push('/auth/login'); };

  return (
    <aside className={cn('flex flex-col w-60 min-h-screen bg-gradient-to-b text-white', gradient)}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-base leading-none">DataServ</p>
            <p className="text-white/60 text-xs mt-0.5">Service Technique</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="font-medium text-sm truncate">{user?.name}</p>
            <p className="text-white/50 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <span className="mt-2 inline-block text-xs bg-white/20 px-2 py-0.5 rounded-full">
          {user?.role}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
              pathname === href
                ? 'bg-white/20 font-semibold'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
