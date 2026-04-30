'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

const icons = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info };

const styles = {
  success: 'border-emerald-200 bg-emerald-50',
  error: 'border-red-200 bg-red-50',
  warning: 'border-amber-200 bg-amber-50',
  info: 'border-blue-200 bg-blue-50',
};

const iconStyles = {
  success: 'text-emerald-600',
  error: 'text-red-600',
  warning: 'text-amber-600',
  info: 'text-blue-600',
};

let toastListeners: Array<(toasts: ToastData[]) => void> = [];
let toasts: ToastData[] = [];

function notifyListeners() {
  toastListeners.forEach(fn => fn([...toasts]));
}

export function toast(type: ToastType, title: string, message?: string, duration = 4000) {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, type, title, message, duration }];
  notifyListeners();
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    notifyListeners();
  }, duration);
}

export const showToast = {
  success: (title: string, message?: string) => toast('success', title, message),
  error: (title: string, message?: string) => toast('error', title, message),
  warning: (title: string, message?: string) => toast('warning', title, message),
  info: (title: string, message?: string) => toast('info', title, message),
};

function ToastItem({ toast: t, onRemove }: { toast: ToastData; onRemove: () => void }) {
  const [visible, setVisible] = useState(false);
  const Icon = icons[t.type];

  useEffect(() => { setTimeout(() => setVisible(true), 10); }, []);

  return (
    <div className={cn(
      'flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-sm w-full transition-all duration-300',
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
      styles[t.type]
    )}>
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconStyles[t.type])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{t.title}</p>
        {t.message && <p className="text-xs text-slate-600 mt-0.5">{t.message}</p>}
      </div>
      <button onClick={onRemove} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function Toaster() {
  const [toastList, setToastList] = useState<ToastData[]>([]);

  useEffect(() => {
    toastListeners.push(setToastList);
    return () => { toastListeners = toastListeners.filter(fn => fn !== setToastList); };
  }, []);

  const remove = (id: string) => {
    toasts = toasts.filter(t => t.id !== id);
    notifyListeners();
  };

  if (toastList.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toastList.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={() => remove(t.id)} />
        </div>
      ))}
    </div>
  );
}