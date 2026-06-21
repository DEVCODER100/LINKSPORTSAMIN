'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

// Gates every dashboard page: restores the session, redirects to /login if there's
// no token, and blocks non-admin accounts.
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, fetchMe } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') || localStorage.getItem('refreshToken') : null;
    if (!token) {
      router.replace('/login');
      return;
    }
    (async () => {
      await fetchMe();
      setChecked(true);
    })();
  }, [fetchMe, router]);

  if (!checked && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-3" />
        <h1 className="text-lg font-semibold text-gray-900">Not authorized</h1>
        <p className="text-sm text-gray-500 mt-1">This account ({user.email}) is not an admin.</p>
        <button onClick={() => useAuthStore.getState().logout().then(() => router.replace('/login'))} className="btn-ghost mt-4">Sign out</button>
      </div>
    );
  }

  return <>{children}</>;
}
