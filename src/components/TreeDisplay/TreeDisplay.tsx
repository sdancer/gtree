
"use client";
import React from 'react';
import { useTree } from '@/contexts/TreeDataProvider';
import TreeNodeItem from './TreeNodeItem';
import { ScrollArea } from '@/components/ui/scroll-area';

export function TreeDisplay() {
  const { treeData } = useTree();

  if (treeData.rootNodeIds.length === 0) {
    return (
      <div className="h-full p-6 flex items-center justify-center text-center bg-card rounded-lg">
        <p className="text-muted-foreground text-lg">
          No plans yet. Click "Add Root" in the header to get started.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full bg-card rounded-lg">
      <div className="p-2 md:p-4 space-y-2">
        {treeData.rootNodeIds.map(rootNodeId => (
          <TreeNodeItem key={rootNodeId} nodeId={rootNodeId} level={0} />
        ))}
      </div>
    </ScrollArea>
  );
}

