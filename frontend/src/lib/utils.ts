import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TicketStatus, Priority, InterventionType } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('fr-TN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString('fr-TN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export const STATUS_LABELS: Record<TicketStatus, string> = {
  NOUVEAU: 'Nouveau',
  EN_COURS: 'En cours',
  RESOLU: 'Résolu',
  CLOTURE: 'Clôturé',
};

export const STATUS_COLORS: Record<TicketStatus, string> = {
  NOUVEAU: 'bg-blue-100 text-blue-700',
  EN_COURS: 'bg-amber-100 text-amber-700',
  RESOLU: 'bg-green-100 text-green-700',
  CLOTURE: 'bg-gray-100 text-gray-600',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  NORMAL: 'Normal',
  URGENT: 'Urgent',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  NORMAL: 'bg-gray-100 text-gray-600',
  URGENT: 'bg-red-100 text-red-700',
};

export const TYPE_LABELS: Record<InterventionType, string> = {
  DISTANCE: 'À distance',
  SUR_SITE: 'Sur site',
};

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}