import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'LinkSports Admin',
  description: 'LinkSports admin dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1f2937', color: '#fff', borderRadius: '8px' } }} />
      </body>
    </html>
  );
}
