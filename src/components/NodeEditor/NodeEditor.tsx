
"use client";
import React, { useState, useEffect } from 'react';
import type { PlanNode, EditRecord } from '@/types';
import { NodeStatus } from '@/types';
import { useTree } from '@/contexts/TreeDataProvider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import StatusIcon from '@/components/TreeDisplay/StatusIcon';
import { Save, Spline, Zap, Loader2, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function NodeEditor() {
  const { selectedNodeId, treeData, updateNode, decomposeNodeAndUpdateTree, executeNodePlanAndUpdateTree, isLoading } = useTree();
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<NodeStatus>(NodeStatus.Pending);

  const node = selectedNodeId ? treeData.nodes[selectedNodeId] : null;
  const currentActionNodeId = isLoading && selectedNodeId ? selectedNodeId : null;

  useEffect(() => {
    if (node) {
      setContent(node.content);
      setStatus(node.status);
    } else {
      setContent('');
      setStatus(NodeStatus.Pending);
    }
  }, [node]);

  if (!node) {
    return (
      <div className="w-full md:w-1/2 lg:w-1/3 p-6 flex items-center justify-center bg-card rounded-lg m-2">
        <p className="text-muted-foreground text-lg">Select a node to edit its details.</p>
      </div>
    );
  }

  const handleSave = () => {
    updateNode(node.id, { content, status });
  };
  
  const handleDecompose = () => decomposeNodeAndUpdateTree(node.id);
  const handleExecute = () => executeNodePlanAndUpdateTree(node.id);

  const handleStatusChange = (newStatus: NodeStatus) => {
    setStatus(newStatus);
    updateNode(node.id, { status: newStatus });
  }

  return (
    <Card className="w-full md:w-1/2 lg:w-1/3 m-2 flex flex-col max-h-[calc(100vh-80px)]">
      <CardHeader>
        <CardTitle className="truncate">Edit: {node.content.split('\n')[0] || "Untitled Node"}</CardTitle>
        <CardDescription>ID: {node.id}</CardDescription>
      </CardHeader>
      <ScrollArea className="flex-grow">
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="node-content">Content (Markdown)</Label>
            <Textarea
              id="node-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="font-mono bg-input text-card-foreground border-input-border"
            />
          </div>
          <div>
            <Label>Preview</Label>
            <div className="p-2 border rounded-md min-h-[50px] bg-input border-input-border">
              <MarkdownRenderer content={content} />
            </div>
          </div>
          <div>
            <Label htmlFor="node-status">Status</Label>
            <div className="flex items-center gap-2">
              <StatusIcon status={status} />
               <Select value={status} onValueChange={(value: NodeStatus) => handleStatusChange(value)}>
                <SelectTrigger className="w-[180px] bg-input text-card-foreground border-input-border">
                  <SelectValue placeholder="Set status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(NodeStatus).map(s => (
                    <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
             <Label>Edit History</Label>
             <ScrollArea className="h-32 border rounded-md p-2 bg-input border-input-border">
                {node.editHistory.slice().reverse().map((record: EditRecord, index: number) => (
                  <div key={index} className="text-xs text-muted-foreground mb-1 border-b border-input-border/50 pb-1">
                    <span className="font-semibold">{new Date(record.timestamp).toLocaleString()}:</span>
                    <p className="truncate font-mono">{record.content.split('\n')[0]}</p>
                  </div>
                ))}
             </ScrollArea>
          </div>
          <div className="text-xs text-muted-foreground">
            <p>Created: {new Date(node.createdAt).toLocaleString()}</p>
            <p>Updated: {new Date(node.updatedAt).toLocaleString()}</p>
          </div>
        </CardContent>
      </ScrollArea>
      <CardFooter className="flex justify-end space-x-2 border-t pt-4">
         {currentActionNodeId === node.id && isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : (
            <>
              <Button variant="outline" onClick={handleDecompose} title="Decompose this plan node">
                <Spline className="mr-2 h-4 w-4" /> Decompose
              </Button>
              <Button variant="outline" onClick={handleExecute} title="Execute this plan node and its children">
                <Zap className="mr-2 h-4 w-4" /> Execute
              </Button>
              <Button onClick={handleSave} title="Save changes to this node">
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
            </>
          )}
      </CardFooter>
    </Card>
  );
}
