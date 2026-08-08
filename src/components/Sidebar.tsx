'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Building2, Dumbbell, Medal, ClipboardCheck, LogOut, ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const LINKS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/members', label: 'Members', icon: Users },
  { href: '/athletes', label: 'Athletes', icon: Medal },
  { href: '/coaches', label: 'Coaches', icon: Dumbbell },
  { href: '/organizations', label: 'Organizations', icon: Building2 },
  { href: '/approvals', label: 'Approvals', icon: ClipboardCheck },
];

// Reusable nav panel — used as the fixed desktop column and inside the mobile drawer.
export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <div className="w-64 h-full min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-brand" />
        <span className="font-bold text-gray-900">linksports<span className="text-brand">.in</span></span>
        <span className="text-[10px] font-bold text-brand bg-blue-50 px-1.5 py-0.5 rounded ml-auto">ADMIN</span>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Icon className="w-4 h-4" /> {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 px-3 mb-2 truncate">{user?.email}</p>
        <button onClick={() => { onNavigate?.(); useAuthStore.getState().logout().then(() => router.replace('/login')); }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );
}
