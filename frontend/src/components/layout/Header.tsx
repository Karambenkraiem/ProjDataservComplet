'use client';
import { Bell } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

interface HeaderProps { title: string; subtitle?: string }

export function Header({ title, subtitle }: HeaderProps) {
  const user = useAuthStore((s) => s.user);
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 relative">
          <Bell className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
