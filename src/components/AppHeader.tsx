
"use client";
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTree } from '@/contexts/TreeDataProvider';
import { FileUp, FileDown, PlusCircle, BrainCircuit, RefreshCw } from 'lucide-react'; // BrainCircuit for app icon

export function AppHeader() {
  const { addNode, importTree, exportTree, fetchAndSetTreeData, isLoading } = useTree();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddRootNode = () => {
    const newNode = addNode(null, "New Root Plan");
    // Optionally, select the new node
    // selectNode(newNode.id);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          importTree(content);
        } catch (error) {
          console.error("Error reading file:", error);
          // Toast error handled in context
        }
      };
      reader.readAsText(file);
      // Reset file input value to allow importing the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleExport = () => {
    const jsonData = exportTree();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plan_weaver_export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    fetchAndSetTreeData();
  };

  return (
    <header className="bg-card text-card-foreground p-4 shadow-md flex items-center justify-between border-b">
      <div className="flex items-center gap-2">
        <BrainCircuit className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Plan Weaver</h1>
      </div>
      <div className="space-x-2">
        <Button variant="outline" onClick={() => fileInputRef.current?.click()} title="Import Plan from JSON" disabled={isLoading}>
          <FileUp className="mr-2 h-4 w-4" /> Import
        </Button>
        <Input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".json"
          onChange={handleImport}
          disabled={isLoading}
        />
        <Button variant="outline" onClick={handleExport} title="Export Plan to JSON" disabled={isLoading}>
          <FileDown className="mr-2 h-4 w-4" /> Export
        </Button>
        <Button variant="outline" onClick={handleRefresh} title="Refresh Data from Source" disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
        <Button variant="outline" onClick={handleAddRootNode} title="Add New Root Plan" disabled={isLoading}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Root
        </Button>
      </div>
    </header>
  );
}
