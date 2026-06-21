'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search, X, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';

type Row = Record<string, any>;
type Type = 'athlete' | 'coach' | 'organization';

const name = (r: Row) => r.fullName || r.name || '—';
const detail = (r: Row) =>
  r.primarySport ||
  (Array.isArray(r.sportsSpecialization) ? r.sportsSpecialization.join(', ') : '') ||
  (Array.isArray(r.sports) ? r.sports.join(', ') : '') || '—';
const place = (r: Row) => [r.location?.city, r.location?.state].filter(Boolean).join(', ') || '—';

export default function ProfilesView({ type, title }: { type: Type; title: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [drawer, setDrawer] = useState<Row | null>(null);
  const limit = 25;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { type, page, limit };
      if (q) params.q = q;
      const res = await adminAPI.getProfiles(params);
      setRows(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
    } catch { toast.error(`Failed to load ${title.toLowerCase()}`); }
    setLoading(false);
  }, [type, page, q, title]);
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500">{total} total</p>
      </div>

      <div className="card p-3 relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input className="input pl-9" placeholder={`Search ${title.toLowerCase()} by name…`} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
      </div>

      <div className="card overflow-hidden">
        {loading ? <div className="p-10 text-center text-gray-400">Loading…</div>
          : rows.length === 0 ? <div className="p-10 text-center text-gray-400">None found.</div>
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="text-left px-4 py-3">Name</th>
                    <th className="text-left px-4 py-3">{type === 'organization' ? 'Sports' : 'Sport'}</th>
                    <th className="text-left px-4 py-3">Location</th>
                    <th className="text-left px-4 py-3">Owner</th>
                    <th className="text-left px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setDrawer(r)}>
                      <td className="px-4 py-3 font-medium text-gray-900 capitalize">{String(name(r)).toLowerCase()}</td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{detail(r)}</td>
                      <td className="px-4 py-3 text-gray-500">{place(r)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{r.owner?.email || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{formatDate(r.owner?.joinedAt || r.createdAt)}</td>
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

      {drawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setDrawer(null)}>
          <div className="bg-white w-full max-w-md h-full overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 capitalize">{String(name(drawer)).toLowerCase()}</h2>
              <button onClick={() => setDrawer(null)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-1.5 text-sm text-gray-600 mb-4">
              {drawer.owner?.email && <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> {drawer.owner.email}</p>}
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> {place(drawer)}</p>
            </div>
            <pre className="text-[11px] bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-words text-gray-700">
{JSON.stringify(drawer, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
