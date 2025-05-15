
"use client";
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTree } from '@/contexts/TreeDataProvider';
import { FileUp, FileDown, PlusCircle, Binary, RefreshCw, ClipboardPaste } from 'lucide-react'; // Added ClipboardPaste
import { useToast } from '@/hooks/use-toast';

export function AppHeader() {
  const { addNode, importTree, exportTree, fetchAndSetTreeData, isLoading } = useTree();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAddRootNode = () => {
    addNode(null, "New Root Plan");
  };

  const handleImportFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          importTree(content); // importTree handles its own toast messages for success/failure
        } catch (error) {
          console.error("Error reading file:", error);
          toast({
            variant: "destructive",
            title: "File Read Error",
            description: "Could not read the selected file.",
          });
        }
      };
      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "File Read Error",
          description: "Failed to read the file.",
        });
      };
      reader.readAsText(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImportFromClipboard = async () => {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      toast({
        variant: "destructive",
        title: "Clipboard Error",
        description: "Clipboard API not available in this browser.",
      });
      return;
    }
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim() === "") {
        toast({
          variant: "destructive",
          title: "Clipboard Empty",
          description: "Nothing to import from clipboard.",
        });
        return;
      }
      importTree(text); // importTree handles its own toast messages for success/failure of parsing
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      let description = "Could not read from clipboard.";
      if (err instanceof Error && (err.name === 'NotAllowedError' || err.message.includes('permission'))) {
        description = "Clipboard permission denied. Please allow access in your browser settings.";
      }
      toast({
        variant: "destructive",
        title: "Clipboard Read Error",
        description: description,
      });
    }
  };

  const handleExport = () => {
    const jsonData = exportTree();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yggdrasil_export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Export Successful", description: "Tree data downloaded as yggdrasil_export.json."});
  };

  const handleRefresh = () => {
    fetchAndSetTreeData();
  };

  return (
    <header className="bg-card text-card-foreground p-4 shadow-md flex items-center justify-between border-b">
      <div className="flex items-center gap-2">
        <Binary className="h-8 w-8 text-primary" /> 
        <h1 className="text-2xl font-bold text-primary">Yggdrasil</h1>
      </div>
      <div className="space-x-2">
        <Button variant="outline" onClick={handleImportFromClipboard} title="Import Plan from Clipboard" disabled={isLoading}>
          <ClipboardPaste className="mr-2 h-4 w-4" /> Paste
        </Button>
        <Button variant="outline" onClick={() => fileInputRef.current?.click()} title="Import Plan from JSON file" disabled={isLoading}>
          <FileUp className="mr-2 h-4 w-4" /> Import File
        </Button>
        <Input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".json"
          onChange={handleImportFromFile}
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
