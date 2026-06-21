'use client';

import { useEffect, useState } from 'react';
import { Users, Medal, Dumbbell, Building2, FileText, Briefcase, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface Dash {
  users: { total: number; athletes: number; coaches: number; organizations: number };
  listings: { active: number };
  jobs: { active: number };
  revenue: { total: number };
  pendingApprovals: { listings: number; organizations: number };
}

export default function OverviewPage() {
  const [d, setD] = useState<Dash | null>(null);
  const [loading, setLoading] = useState(true);
  const [ann, setAnn] = useState({ title: '', message: '', targetRole: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    adminAPI.getDashboard().then((r) => setD(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const send = async () => {
    if (!ann.title || !ann.message) { toast.error('Title and message are required'); return; }
    setSending(true);
    try {
      await adminAPI.sendAnnouncement({ title: ann.title, message: ann.message, targetRole: ann.targetRole || undefined });
      toast.success('Announcement sent');
      setAnn({ title: '', message: '', targetRole: '' });
    } catch { toast.error('Failed to send'); }
    setSending(false);
  };

  const Stat = ({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string | number; accent?: string }) => (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-gray-500 text-xs font-medium"><Icon className={`w-4 h-4 ${accent || ''}`} /> {label}</div>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500">LinkSports platform at a glance</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[...Array(8)].map((_, i) => <div key={i} className="card p-4 h-20 animate-pulse" />)}</div>
      ) : d ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat icon={Users} label="Total members" value={d.users.total} accent="text-brand" />
            <Stat icon={Medal} label="Athletes" value={d.users.athletes} accent="text-green-600" />
            <Stat icon={Dumbbell} label="Coaches" value={d.users.coaches} accent="text-blue-600" />
            <Stat icon={Building2} label="Organizations" value={d.users.organizations} accent="text-orange-600" />
            <Stat icon={FileText} label="Active trials" value={d.listings.active} />
            <Stat icon={Briefcase} label="Active jobs" value={d.jobs.active} />
            <Stat icon={Users} label="Revenue" value={formatCurrency(d.revenue.total)} />
            <Stat icon={FileText} label="Pending approvals" value={d.pendingApprovals.listings + d.pendingApprovals.organizations} accent="text-amber-600" />
          </div>

          <div className="card p-5 max-w-2xl">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Send className="w-4 h-4 text-brand" /> Send announcement</h2>
            <div className="space-y-3">
              <input className="input" placeholder="Title" value={ann.title} onChange={(e) => setAnn({ ...ann, title: e.target.value })} />
              <textarea rows={3} className="input" placeholder="Message" value={ann.message} onChange={(e) => setAnn({ ...ann, message: e.target.value })} />
              <div className="flex items-center gap-3">
                <select className="input w-auto" value={ann.targetRole} onChange={(e) => setAnn({ ...ann, targetRole: e.target.value })}>
                  <option value="">Everyone</option>
                  <option value="athlete">Athletes</option>
                  <option value="coach">Coaches</option>
                  <option value="organization">Organizations</option>
                </select>
                <button onClick={send} disabled={sending} className="btn-primary">{sending ? 'Sending…' : 'Send'}</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="text-gray-400">Could not load dashboard.</p>
      )}
    </div>
  );
}
