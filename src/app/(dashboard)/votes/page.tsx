'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface VoteRow {
  _id: string; player: 'Messi' | 'Ronaldo'; name?: string; phone?: string; distanceM?: number; createdAt: string;
}

export default function VotesPage() {
  const [rows, setRows] = useState<VoteRow[]>([]);
  const [counts, setCounts] = useState({ messi: 0, ronaldo: 0, total: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [player, setPlayer] = useState('');
  const [loading, setLoading] = useState(false);
  const limit = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit };
      if (q) params.q = q;
      if (player) params.player = player;
      const res = await adminAPI.getVotes(params);
      setRows(res.data.data.items || []);
      setCounts(res.data.data.counts || { messi: 0, ronaldo: 0, total: 0 });
      setTotal(res.data.pagination?.total || 0);
    } catch { toast.error('Failed to load votes'); }
    setLoading(false);
  }, [page, q, player]);
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  const reset = async () => {
    if (!confirm('Delete ALL votes? This permanently clears every vote (use to wipe test data before the event). This cannot be undone.')) return;
    try { const r = await adminAPI.resetVotes(); toast.success(`Cleared ${r.data.data?.deleted ?? 0} votes`); load(); }
    catch { toast.error('Failed to reset votes'); }
  };

  const pct = (n: number) => (counts.total ? Math.round((n / counts.total) * 100) : 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Votes</h1>
          <p className="text-sm text-gray-500">Footiefiesta — Messi vs Ronaldo · {counts.total} total votes</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="btn-ghost flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Refresh</button>
          <button onClick={reset} className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50">Reset all votes</button>
        </div>
      </div>

      {/* Score cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {([['Messi', counts.messi, '#2563eb'], ['Ronaldo', counts.ronaldo, '#64748b']] as const).map(([label, n, color]) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">{label}</span>
              <span className="text-2xl font-bold" style={{ color }}>{n}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pct(n)}%`, background: color }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">{pct(n)}% of votes</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder="Search by name or phone…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        <select className="input w-auto" value={player} onChange={(e) => { setPlayer(e.target.value); setPage(1); }}>
          <option value="">Both players</option>
          <option value="Messi">Messi</option>
          <option value="Ronaldo">Ronaldo</option>
        </select>
      </div>

      {/* Voter table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No votes yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Phone</th>
                  <th className="text-left px-4 py-3">Voted for</th>
                  <th className="text-left px-4 py-3">Distance</th>
                  <th className="text-left px-4 py-3">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{v.name || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{v.phone ? <a href={`tel:${v.phone}`} className="text-gray-700 hover:text-brand">{v.phone}</a> : '—'}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${v.player === 'Messi' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{v.player}</span></td>
                    <td className="px-4 py-3 text-gray-500">{typeof v.distanceM === 'number' ? `${v.distanceM} m` : '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(v.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {total > limit && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost disabled:opacity-50">Previous</button>
          <span className="text-sm text-gray-500">Page {page} of {Math.ceil(total / limit)}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / limit)} className="btn-ghost disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
