
"use client";
import { AppHeader } from '@/components/AppHeader';
import { TreeDisplay } from '@/components/TreeDisplay/TreeDisplay';
import { NodeEditor } from '@/components/NodeEditor/NodeEditor';
import { useTree } from '@/contexts/TreeDataProvider';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"; // Assuming you'll add this component

export default function PlanWeaverPage() {
  const { selectedNodeId } = useTree();

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      <AppHeader />
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 flex flex-row overflow-hidden p-2 gap-2"
      >
        <ResizablePanel defaultSize={40} minSize={20}>
          <TreeDisplay />
        </ResizablePanel>
        <ResizableHandle withHandle className="mx-1 bg-border w-2 rounded-md hover:bg-primary/20 transition-colors" />
        <ResizablePanel defaultSize={60} minSize={30}>
          {/* The NodeEditor will now fill this panel */}
          {/* Conditional rendering handled inside NodeEditor or here if preferred */}
           <NodeEditor />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
