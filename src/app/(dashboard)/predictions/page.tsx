'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Row {
  userId: string; name: string; email: string; role: string;
  champion: string | null; finalists: string[]; pickedTeams: string[];
  correct: boolean | null; updatedAt: string;
}

export default function PredictionsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [stats, setStats] = useState<{ team: string; count: number }[]>([]);
  const [total, setTotal] = useState(0);
  const [subs, setSubs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [f, setF] = useState({ team: '', champion: '', actualChampion: '', result: '' });

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        Object.entries(f).forEach(([k, v]) => { if (v) params[k] = v; });
        const res = await adminAPI.getPredictions(params);
        setRows(res.data.data.items || []);
        setStats(res.data.data.championCounts || []);
        setTotal(res.data.data.total || 0);
        setSubs(res.data.data.totalSubmissions || 0);
      } catch { toast.error('Failed to load predictions'); }
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [f]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Predictions</h1>
        <p className="text-sm text-gray-500">World Cup bracket submissions — who predicted what</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4"><p className="text-xs text-gray-500">Total predictions</p><p className="text-2xl font-bold text-gray-900">{subs}</p></div>
        <div className="card p-4"><p className="text-xs text-gray-500">Matching filters</p><p className="text-2xl font-bold text-brand">{total}</p></div>
        <div className="card p-4"><p className="text-xs text-gray-500">Distinct champions</p><p className="text-2xl font-bold text-gray-900">{stats.length}</p></div>
      </div>

      {stats.length > 0 && (
        <div className="card p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Champion picks — click to filter</p>
          <div className="flex flex-wrap gap-2">
            {stats.map((s) => (
              <button key={s.team} onClick={() => setF((x) => ({ ...x, champion: x.champion === s.team ? '' : s.team }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${f.champion === s.team ? 'bg-brand text-white border-brand' : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-brand'}`}>
                {s.team} <span className="opacity-70">· {s.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div><label className="text-xs text-gray-500">Predicted team (anywhere)</label><input className="input mt-1" placeholder="e.g. Brazil" value={f.team} onChange={(e) => setF({ ...f, team: e.target.value })} /></div>
        <div><label className="text-xs text-gray-500">Champion pick</label><input className="input mt-1" placeholder="e.g. Argentina" value={f.champion} onChange={(e) => setF({ ...f, champion: e.target.value })} /></div>
        <div><label className="text-xs text-gray-500">Actual champion (win/lose)</label><input className="input mt-1" placeholder="Real winner" value={f.actualChampion} onChange={(e) => setF({ ...f, actualChampion: e.target.value })} /></div>
        <div><label className="text-xs text-gray-500">Result</label>
          <select className="input mt-1 disabled:bg-gray-100" disabled={!f.actualChampion} value={f.result} onChange={(e) => setF({ ...f, result: e.target.value })}>
            <option value="">All</option><option value="correct">Won</option><option value="incorrect">Lost</option>
          </select>
        </div>
        <div className="sm:col-span-2 lg:col-span-4"><button onClick={() => setF({ team: '', champion: '', actualChampion: '', result: '' })} className="text-xs text-brand hover:underline">Clear filters</button></div>
      </div>

      <div className="card overflow-hidden">
        {loading ? <div className="p-10 text-center text-gray-400">Loading…</div>
          : rows.length === 0 ? <div className="p-10 text-center text-gray-400">No predictions match.</div>
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="text-left px-4 py-3">User</th>
                    <th className="text-left px-4 py-3">Champion</th>
                    <th className="text-left px-4 py-3">Finalists</th>
                    <th className="text-left px-4 py-3">Teams picked</th>
                    {f.actualChampion && <th className="text-left px-4 py-3">Result</th>}
                    <th className="text-left px-4 py-3">Saved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3"><div className="font-medium text-gray-900">{p.name}</div><div className="text-xs text-gray-400">{p.email}</div><span className="text-[10px] uppercase font-bold text-brand">{p.role}</span></td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{p.champion || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{(p.finalists || []).join(' · ') || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-xs"><span className="line-clamp-2">{(p.pickedTeams || []).join(', ') || '—'}</span></td>
                      {f.actualChampion && <td className="px-4 py-3">{p.correct ? <span className="text-green-700 font-bold">✓ Won</span> : <span className="text-red-600 font-bold">✗ Lost</span>}</td>}
                      <td className="px-4 py-3 text-xs text-gray-400">{formatDate(p.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}
