'use client';
import { createContext, useContext, useState } from 'react';
import { Sidebar } from './Sidebar';

interface SidebarCtx { open: boolean; toggle: () => void; close: () => void }

export const SidebarContext = createContext<SidebarCtx>({
  open: false,
  toggle: () => {},
  close: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{ open, toggle: () => setOpen((v) => !v), close: () => setOpen(false) }}
    >
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        {/* Mobile backdrop */}
        {open && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Sidebar wrapper */}
        <div
          className={`
            fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out
            md:relative md:z-auto md:translate-x-0
            ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto min-w-0">{children}</main>
      </div>
    </SidebarContext.Provider>
  );
}
