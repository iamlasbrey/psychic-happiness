// src/app/(app)/layout.tsx
import type { ReactNode } from 'react';
import TopSidebar from '@/components/layout/TopSidebar';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <TopSidebar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}