'use client';

import { useState } from 'react';
import { Menu, X, ShieldCheck } from 'lucide-react';
import Sidebar from './Sidebar';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:flex min-h-screen">
      {/* Desktop / tablet sidebar */}
      <div className="hidden md:block sticky top-0 h-screen shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4">
          <span className="font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand" /> linksports<span className="text-brand">.in</span>
          </span>
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="p-2 -mr-2 rounded-lg hover:bg-gray-100">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8">{children}</main>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 shadow-xl">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute top-3 right-3 z-10 p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
