
"use client";
import React from 'react';
import type { PlanNode } from '@/types';
import { useTree } from '@/contexts/TreeDataProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import StatusIcon from '@/components/TreeDisplay/StatusIcon';
import { Plus, Trash2, ChevronDown, ChevronRight, Zap, Spline, Edit3, Loader2 } from 'lucide-react';

interface TreeNodeItemProps {
  nodeId: string;
  level: number;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({ nodeId, level }) => {
  const { 
    treeData, 
    selectNode, 
    deleteNode, 
    addNode, 
    decomposeNodeAndUpdateTree, 
    executeNodePlanAndUpdateTree,
    selectedNodeId,
    isLoading,
    toggleNodeCollapse,
    isNodeCollapsed
  } = useTree();
  
  const node = treeData.nodes[nodeId];

  if (!node) return null;

  const isSelected = selectedNodeId === nodeId;
  const collapsed = isNodeCollapsed(nodeId);
  const currentActionNodeId = isLoading && selectedNodeId === nodeId ? nodeId : null;


  const handleDecompose = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(nodeId); // Select node before action
    decomposeNodeAndUpdateTree(nodeId);
  };

  const handleExecute = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(nodeId); // Select node before action
    executeNodePlanAndUpdateTree(nodeId);
  };

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    addNode(nodeId, "New Sub-Plan");
    if(collapsed) toggleNodeCollapse(nodeId); // Expand parent if collapsed
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(nodeId);
  };

  return (
    <div style={{ marginLeft: `${level * 20}px` }} className="my-2">
      <Card 
        className={`bg-card border rounded-lg shadow-sm transition-all ${isSelected ? 'ring-2 ring-primary' : 'border-plan-node-border hover:shadow-md'}`}
        onClick={() => selectNode(nodeId)}
      >
        <CardHeader className="flex flex-row items-center justify-between p-3 space-y-0">
          <div className="flex items-center gap-2">
            {node.childrenIds.length > 0 && (
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleNodeCollapse(nodeId); }} className="h-6 w-6">
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
            <StatusIcon status={node.status} />
            <CardTitle className="text-md font-medium truncate max-w-xs sm:max-w-sm md:max-w-md" title={node.content.split('\n')[0]}>
              {node.content.split('\n')[0] || "Untitled Node"}
            </CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            {currentActionNodeId === nodeId && isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <>
                <Button variant="ghost" size="icon" onClick={() => selectNode(nodeId)} title="Edit Node" className="h-7 w-7">
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleAddChild} title="Add Child Node" className="h-7 w-7">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleDecompose} title="Decompose Plan" className="h-7 w-7">
                  <Spline className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleExecute} title="Execute Plan" className="h-7 w-7">
                  <Zap className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleDelete} title="Delete Node" className="h-7 w-7 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        {!collapsed && node.content.split('\n').length > 1 && (
           <CardContent className="p-3 pt-0">
             <MarkdownRenderer content={node.content.split('\n').slice(1).join('\n')} className="text-sm text-muted-foreground" />
           </CardContent>
        )}
      </Card>
      {!collapsed && node.childrenIds.map(childId => (
        <TreeNodeItem key={childId} nodeId={childId} level={level + 1} />
      ))}
    </div>
  );
};

export default TreeNodeItem;
