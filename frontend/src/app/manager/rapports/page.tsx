'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clientsApi, rapportsApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { downloadBlob } from '@/lib/utils';
import { FileDown, Calendar, Building2 } from 'lucide-react';

export default function RapportsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [excelFilters, setExcelFilters] = useState({ from: '', to: '', clientId: '' });
  const [mensuel, setMensuel] = useState({ clientId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });

  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: clientsApi.list });

  const handleExportExcel = async () => {
    setLoading('excel');
    try {
      const blob = await rapportsApi.exportExcel({
        from: excelFilters.from || undefined,
        to: excelFilters.to || undefined,
        clientId: excelFilters.clientId || undefined,
      });
      downloadBlob(blob, `interventions-${Date.now()}.xlsx`);
    } finally { setLoading(null); }
  };

  const handleMensuel = async () => {
    if (!mensuel.clientId) return;
    setLoading('mensuel');
    try {
      const blob = await rapportsApi.mensuel(mensuel.clientId, mensuel.month, mensuel.year);
      downloadBlob(blob, `rapport-mensuel-${mensuel.year}-${String(mensuel.month).padStart(2, '0')}.xlsx`);
    } finally { setLoading(null); }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Rapports & Exports" />
      <div className="flex-1 p-6 overflow-y-auto max-w-3xl">
        <div className="space-y-6">
          {/* Export Excel */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <FileDown className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">Export Excel des interventions</h2>
                <p className="text-sm text-slate-500">Toutes les interventions sur une période</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date début</label>
                <input type="date" value={excelFilters.from}
                  onChange={e => setExcelFilters(f => ({ ...f, from: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date fin</label>
                <input type="date" value={excelFilters.to}
                  onChange={e => setExcelFilters(f => ({ ...f, to: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Client (optionnel)</label>
                <select value={excelFilters.clientId}
                  onChange={e => setExcelFilters(f => ({ ...f, clientId: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">Tous les clients</option>
                  {clients.map((c: any) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleExportExcel} disabled={loading === 'excel'}
              className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors disabled:opacity-60">
              <FileDown className="w-4 h-4" />
              {loading === 'excel' ? 'Export en cours…' : 'Télécharger Excel'}
            </button>
          </div>

          {/* Rapport mensuel */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-violet-700" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">Rapport mensuel client</h2>
                <p className="text-sm text-slate-500">Heures consommées et interventions par client</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Client *</label>
                <select value={mensuel.clientId}
                  onChange={e => setMensuel(m => ({ ...m, clientId: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">Sélectionner</option>
                  {clients.map((c: any) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Mois</label>
                <select value={mensuel.month}
                  onChange={e => setMensuel(m => ({ ...m, month: +e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleDateString('fr-TN', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Année</label>
                <input type="number" value={mensuel.year}
                  onChange={e => setMensuel(m => ({ ...m, year: +e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <button onClick={handleMensuel} disabled={loading === 'mensuel' || !mensuel.clientId}
              className="flex items-center gap-2 bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-800 transition-colors disabled:opacity-60">
              <FileDown className="w-4 h-4" />
              {loading === 'mensuel' ? 'Génération…' : 'Télécharger rapport'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
