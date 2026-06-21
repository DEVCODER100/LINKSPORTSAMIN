'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(email.trim(), password);
      if (user.role !== 'admin') {
        toast.error('This account is not an admin.');
        await useAuthStore.getState().logout();
        setBusy(false);
        return;
      }
      toast.success('Welcome back');
      router.replace('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Login failed';
      toast.error(msg);
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand via-blue-700 to-indigo-800 px-4">
      <div className="w-full max-w-sm card p-8">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-6 h-6 text-brand" />
          <h1 className="text-xl font-bold text-gray-900">linksports<span className="text-brand">.in</span> Admin</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">Sign in with your admin account.</p>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input mt-1" placeholder="admin@linksports.in" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input mt-1" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full flex items-center justify-center gap-2">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
