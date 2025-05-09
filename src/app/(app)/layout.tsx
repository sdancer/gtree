
"use client"; // This layout is a client component to use context providers

import { TreeDataProvider } from '@/contexts/TreeDataProvider';
import type { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <TreeDataProvider>
      <div className="flex flex-col h-screen">
        {children}
      </div>
    </TreeDataProvider>
  );
}
