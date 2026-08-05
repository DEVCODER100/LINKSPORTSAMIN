'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search, Trash2, Ban, CheckCircle, Plus, X, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface UserRow {
  _id: string; email: string; role: string; isVerified: boolean; isSuspended: boolean; phone?: string; createdAt: string;
}

const ROLES = ['athlete', 'coach', 'professional', 'organization', 'admin'];

export default function MembersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<UserRow | null | undefined>(undefined); // undefined=closed, null=create
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit };
      if (q) params.q = q;
      if (role) params.role = role;
      const res = await adminAPI.getUsers(params);
      setRows(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
    } catch { toast.error('Failed to load members'); }
    setLoading(false);
  }, [page, q, role]);
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  const toggleSuspend = async (u: UserRow) => {
    try { await adminAPI.suspendUser(u._id); toast.success(u.isSuspended ? 'Unsuspended' : 'Suspended'); load(); } catch { toast.error('Failed'); }
  };
  const del = async (u: UserRow) => {
    if (!confirm(`Delete ${u.email}? This removes their profile too.`)) return;
    try { await adminAPI.deleteUser(u._id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-sm text-gray-500">{total} total</p>
        </div>
        <button onClick={() => setModal(null)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add member</button>
      </div>

      <div className="card p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder="Search by email or phone…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        <select className="input w-auto" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No members found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Phone</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Joined</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><button onClick={() => setModal(u)} className="font-medium text-gray-900 hover:text-brand">{u.email}</button></td>
                    <td className="px-4 py-3 whitespace-nowrap">{u.phone ? <a href={`tel:${u.phone}`} className="text-gray-700 hover:text-brand">{u.phone}</a> : <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3"><span className="text-xs font-semibold uppercase text-brand">{u.role}</span></td>
                    <td className="px-4 py-3">
                      {u.isSuspended ? <span className="text-xs font-semibold text-red-600">Suspended</span> :
                        u.isVerified ? <span className="text-xs font-semibold text-green-700 inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Verified</span> :
                          <span className="text-xs text-gray-400">Unverified</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => toggleSuspend(u)} title={u.isSuspended ? 'Unsuspend' : 'Suspend'} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600"><Ban className="w-4 h-4" /></button>
                      <button onClick={() => del(u)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </td>
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

      {modal !== undefined && <MemberModal user={modal} onClose={() => setModal(undefined)} onSaved={() => { setModal(undefined); load(); }} />}
    </div>
  );
}

function MemberModal({ user, onClose, onSaved }: { user: UserRow | null; onClose: () => void; onSaved: () => void }) {
  const editing = !!user;
  const [form, setForm] = useState({
    email: user?.email || '', password: '', role: user?.role || 'athlete', phone: user?.phone || '',
    isVerified: user?.isVerified ?? false, isSuspended: user?.isSuspended ?? false,
  });
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing) {
        const payload: Record<string, unknown> = { role: form.role, phone: form.phone, isVerified: form.isVerified, isSuspended: form.isSuspended };
        if (form.password) payload.password = form.password;
        await adminAPI.updateUser(user!._id, payload);
      } else {
        await adminAPI.createUser({ email: form.email, password: form.password, role: form.role, phone: form.phone });
      }
      toast.success('Saved');
      onSaved();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to save');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="card w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-brand" /> {editing ? 'Edit member' : 'Add member'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={save} className="space-y-3">
          <div><label className="text-xs text-gray-600">Email</label><input className="input mt-1 disabled:bg-gray-100" value={form.email} disabled={editing} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div><label className="text-xs text-gray-600">{editing ? 'New password (optional)' : 'Password'}</label><input type="password" className="input mt-1" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} /></div>
          <div><label className="text-xs text-gray-600">Role</label>
            <select className="input mt-1" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>{ROLES.map((r) => <option key={r} value={r}>{r}</option>)}</select>
          </div>
          <div><label className="text-xs text-gray-600">Phone</label><input className="input mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          {editing && (
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.isVerified} onChange={(e) => setForm({ ...form, isVerified: e.target.checked })} /> Verified</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.isSuspended} onChange={(e) => setForm({ ...form, isSuspended: e.target.checked })} /> Suspended</label>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">{busy ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
