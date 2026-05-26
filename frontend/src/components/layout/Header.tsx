'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, CheckCheck, Menu, Ticket, XCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useNotifications } from '@/hooks/useNotifications';
import { useSidebar } from './AppShell';
import { Notification } from '@/types';

interface HeaderProps { title: string; subtitle?: string }

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}

function NotifIcon({ type }: { type: string }) {
  if (type === 'ticket_created') return <Ticket className="w-4 h-4 text-blue-600" />;
  if (type === 'ticket_assigned') return <Check className="w-4 h-4 text-emerald-600" />;
  if (type === 'ticket_closed') return <XCircle className="w-4 h-4 text-slate-500" />;
  return <Bell className="w-4 h-4 text-violet-600" />;
}

const TICKET_ROUTES: Record<string, string> = {
  MANAGER:    '/manager/tickets',
  TECHNICIEN: '/technicien/tickets',
  CLIENT:     '/client/tickets',
};

export function Header({ title, subtitle }: HeaderProps) {
  const user   = useAuthStore((s) => s.user);
  const router = useRouter();
  const { toggle } = useSidebar();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNotifClick = useCallback(
    async (n: Notification) => {
      if (!n.read) await markRead(n.id);
      setOpen(false);
      if (n.ticketId && user?.role) {
        const base = TICKET_ROUTES[user.role];
        if (base) router.push(`${base}/${n.ticketId}`);
      }
    },
    [markRead, router, user?.role],
  );

  return (
    <header className="h-14 md:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggle}
          className="md:hidden w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base md:text-lg font-semibold text-slate-800 truncate">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 truncate hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        {/* Notification Bell */}
        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 relative"
          >
            <Bell className="w-4 h-4 md:w-[18px] md:h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-[min(320px,calc(100vw-24px))] bg-white border border-slate-200 rounded-xl shadow-xl z-50">
              {/* Dropdown header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-700">
                  Notifications{' '}
                  {unreadCount > 0 && <span className="text-blue-600">({unreadCount})</span>}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" /> Tout lire
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-72 md:max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm py-8">Aucune notification</p>
                ) : (
                  notifications.map((n: Notification) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className={`flex gap-3 px-4 py-3 border-b border-slate-50 transition-colors ${
                        n.ticketId ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'
                      } ${!n.read ? 'bg-blue-50/60' : ''}`}
                    >
                      <div className="mt-0.5 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <NotifIcon type={n.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!n.read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{n.message}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
