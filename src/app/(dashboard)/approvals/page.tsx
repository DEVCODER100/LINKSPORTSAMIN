'use client';

import { useEffect, useState } from 'react';
import { Check, X, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function ApprovalsPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [o, l] = await Promise.all([adminAPI.getPendingOrganizations(), adminAPI.getPendingListings()]);
      setOrgs(o.data.data || []);
      setListings(l.data.data || []);
    } catch { toast.error('Failed to load approvals'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const verifyOrg = async (id: string, action: 'approve' | 'reject') => {
    setBusy(id);
    try { await adminAPI.verifyOrganization(id, action); toast.success(`Organization ${action}d`); load(); }
    catch { toast.error('Failed'); } finally { setBusy(null); }
  };
  const reviewListing = async (id: string, action: 'approve' | 'reject') => {
    setBusy(id);
    try { await adminAPI.reviewListing(id, action); toast.success(`Listing ${action}d`); load(); }
    catch { toast.error('Failed'); } finally { setBusy(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
          <p className="text-sm text-gray-500">Pending organizations & listings</p>
        </div>
        <button onClick={load} className="btn-ghost flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>

      <section>
        <h2 className="font-semibold text-gray-900 mb-2">Organizations <span className="text-gray-400 font-normal">({orgs.length})</span></h2>
        <div className="space-y-2">
          {loading ? <p className="text-gray-400 text-sm">Loading…</p> : orgs.length === 0 ? <p className="text-gray-400 text-sm">None pending.</p> :
            orgs.map((o) => (
              <div key={o._id} className="card p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{o.name}</p>
                  <p className="text-xs text-gray-500">{o.userId?.email} · {formatDate(o.createdAt)}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button disabled={busy === o._id} onClick={() => verifyOrg(o._id, 'approve')} className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Approve</button>
                  <button disabled={busy === o._id} onClick={() => verifyOrg(o._id, 'reject')} className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 flex items-center gap-1"><X className="w-3.5 h-3.5" /> Reject</button>
                </div>
              </div>
            ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-gray-900 mb-2">Listings <span className="text-gray-400 font-normal">({listings.length})</span></h2>
        <div className="space-y-2">
          {loading ? <p className="text-gray-400 text-sm">Loading…</p> : listings.length === 0 ? <p className="text-gray-400 text-sm">None pending.</p> :
            listings.map((l) => (
              <div key={l._id} className="card p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{l.title}</p>
                  <p className="text-xs text-gray-500">{l.organizationId?.name || '—'} · {l.type} · {formatDate(l.createdAt)}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button disabled={busy === l._id} onClick={() => reviewListing(l._id, 'approve')} className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Approve</button>
                  <button disabled={busy === l._id} onClick={() => reviewListing(l._id, 'reject')} className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 flex items-center gap-1"><X className="w-3.5 h-3.5" /> Reject</button>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
