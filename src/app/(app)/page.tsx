
"use client";
import { AppHeader } from '@/components/AppHeader';
import { TreeDisplay } from '@/components/TreeDisplay/TreeDisplay';
import { NodeEditor } from '@/components/NodeEditor/NodeEditor';
import { useTree } from '@/contexts/TreeDataProvider';

export default function PlanWeaverPage() {
  const { selectedNodeId } = useTree();

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      <AppHeader />
      <main className="flex-1 flex flex-row overflow-hidden p-2 gap-2">
        <TreeDisplay />
        {selectedNodeId && <NodeEditor />}
      </main>
    </div>
  );
}
