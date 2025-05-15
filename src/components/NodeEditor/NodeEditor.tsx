
"use client";
import React, { useState, useEffect } from 'react';
import type { PlanNode } from '@/types';
import { NodeStatus } from '@/types';
import { useTree } from '@/contexts/TreeDataProvider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Label } from '@/components/ui/label'; // Label not explicitly used for new report section title
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { Save, Spline, Zap, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function NodeEditor() {
  const { selectedNodeId, treeData, updateNode, decomposeNodeAndUpdateTree, executeNodePlanAndUpdateTree, isLoading } = useTree();
  const [content, setContent] = useState('');
  const [reportContent, setReportContent] = useState('Automated report will appear here.'); // Placeholder for report

  const node = selectedNodeId ? treeData.nodes[selectedNodeId] : null;
  const currentActionNodeId = isLoading && selectedNodeId ? selectedNodeId : null;

  useEffect(() => {
    if (node) {
      setContent(node.content);
      // In a real scenario, reportContent might be fetched or derived based on the node
      // For now, it just resets to placeholder or could be more sophisticated
      setReportContent(`Automated report for node "${node.content.split('\\n')[0] || "Untitled Node"}" will appear here.`);
    } else {
      setContent('');
      setReportContent('Automated report will appear here.');
    }
  }, [node]);

  if (!node) {
    return (
      <div className="h-full flex items-center justify-center bg-card rounded-lg">
        <p className="text-muted-foreground text-lg">Select a node to edit its details.</p>
      </div>
    );
  }

  const handleSave = () => {
    updateNode(node.id, { content });
  };
  
  const handleDecompose = () => decomposeNodeAndUpdateTree(node.id);
  const handleExecute = () => executeNodePlanAndUpdateTree(node.id);

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle className="truncate">{node.content.split('\\n')[0] || "Untitled Node"}</CardTitle>
        <CardDescription>ID: {node.id} | Status: {node.status}</CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="edit" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-6 mt-0 mb-2 shrink-0">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="flex-1 overflow-hidden px-6 pb-2 m-0">
          <ScrollArea className="h-full">
             <Textarea
              id="node-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="font-mono bg-input text-card-foreground border-input-border h-full min-h-[300px] resize-none"
            />
          </ScrollArea>
        </TabsContent>
        <TabsContent value="preview" className="flex-1 overflow-hidden px-6 pb-2 m-0">
          <ScrollArea className="h-full">
            <div className="p-2 border rounded-md h-full min-h-[300px] bg-input border-input-border prose dark:prose-invert max-w-none">
              <MarkdownRenderer content={content} />
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="report" className="flex-1 overflow-hidden px-6 pb-2 m-0">
          <ScrollArea className="h-full">
            <div className="p-2 border rounded-md h-full min-h-[300px] bg-input border-input-border prose dark:prose-invert max-w-none">
              <MarkdownRenderer content={reportContent} />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="flex justify-end space-x-2 border-t pt-4 shrink-0">
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
