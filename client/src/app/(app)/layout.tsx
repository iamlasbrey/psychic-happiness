// src/app/(app)/layout.tsx
import type { ReactNode } from 'react';
import Header from '@/components/layout/Header';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar here later */}
      <div className="flex-1">
        <Header />
        <main className="pt-20">{children}</main>
      </div>
    </div>
  );
}