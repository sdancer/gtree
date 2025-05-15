
"use client";
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { TreeData, PlanNode, PlanForExecution, FetchedTask } from '@/types';
import { NodeStatus } from '@/types'; // Imported NodeStatus as a value
import { createNode, addNodeToTree, updateNodeInTree, deleteNodeFromTree, getSubTreeForExecution } from '@/lib/planUtils';
import { planDecomposition, type PlanDecompositionInput, type PlanDecompositionOutput } from '@/ai/flows/plan-decomposition';
import { executePlan, type ExecutePlanInput, type ExecutePlanOutput } from '@/ai/flows/plan-execution';
import { useToast } from '@/hooks/use-toast';

interface TreeContextType {
  treeData: TreeData;
  selectedNodeId: string | null;
  isLoading: boolean;
  addNode: (parentId?: string | null, content?: string) => PlanNode;
  updateNode: (nodeId: string, updates: Partial<Omit<PlanNode, 'id' | 'parentId' | 'childrenIds' | 'createdAt'>> & { content?: string }) => void;
  deleteNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  importTree: (jsonData: string) => void;
  exportTree: () => string;
  decomposeNodeAndUpdateTree: (nodeId: string) => Promise<void>;
  executeNodePlanAndUpdateTree: (nodeId: string) => Promise<void>;
  fetchAndSetTreeData: () => Promise<void>;
  toggleNodeCollapse: (nodeId: string) => void;
  isNodeCollapsed: (nodeId: string) => boolean;
  collapsedNodes: Set<string>;
}

const TreeContext = createContext<TreeContextType | undefined>(undefined);

const initialTreeData: TreeData = {
  nodes: {},
  rootNodeIds: [],
};

// Helper to initialize with a sample node
function getInitialData(): TreeData {
  const rootNode = createNode("My First Plan", null);
  return {
    nodes: { [rootNode.id]: rootNode },
    rootNodeIds: [rootNode.id],
  };
}

// Recursive helper to transform fetched tasks into PlanNode structure
function processFetchedNodeRecursive(
  fetchedNode: FetchedTask,
  parentId: string | null,
  nodesAccumulator: Record<string, PlanNode>
): string {
  const nodeId = fetchedNode.uid;
  // Combine title and content from fetched data for the PlanNode content
  // If content is empty or only whitespace, use title as the main line.
  const fetchedContent = fetchedNode.content?.trim();
  const planNodeContent = fetchedNode.title + (fetchedContent ? `\n${fetchedContent}` : '');

  const childrenIds: string[] = [];
  if (fetchedNode.children && fetchedNode.children.length > 0) {
    for (const childFetchedNode of fetchedNode.children) {
      childrenIds.push(processFetchedNodeRecursive(childFetchedNode, nodeId, nodesAccumulator));
    }
  }

  const now = new Date().toISOString();
  nodesAccumulator[nodeId] = {
    id: nodeId,
    content: planNodeContent,
    parentId: parentId,
    childrenIds: childrenIds,
    status: NodeStatus.Pending, // Default status for newly fetched nodes
    editHistory: [{ timestamp: now, content: planNodeContent }],
    createdAt: now,
    updatedAt: now,
  };
  return nodeId;
}


export const TreeDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [treeData, setTreeData] = useState<TreeData>(getInitialData());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggleNodeCollapse = useCallback((nodeId: string) => {
    setCollapsedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const isNodeCollapsed = useCallback((nodeId: string) => {
    return collapsedNodes.has(nodeId);
  }, [collapsedNodes]);

  const handleAddNode = useCallback((parentId?: string | null, content: string = "New Node"): PlanNode => {
    const newNode = createNode(content, parentId);
    setTreeData(currentTreeData => addNodeToTree(currentTreeData, newNode));
    // If adding a child to a collapsed node, expand the parent
    if (parentId && collapsedNodes.has(parentId)) {
      // Directly use setCollapsedNodes here, no need to call toggleNodeCollapse in a useCallback for this specific side-effect
      setCollapsedNodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(parentId);
        return newSet;
      });
    }
    return newNode;
  }, [collapsedNodes]); 

  const handleUpdateNode = useCallback((nodeId: string, updates: Partial<Omit<PlanNode, 'id' | 'parentId' | 'childrenIds' | 'createdAt'>> & { content?: string }) => {
    setTreeData(currentTreeData => updateNodeInTree(currentTreeData, nodeId, updates));
  }, []);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setTreeData(currentTreeData => deleteNodeFromTree(currentTreeData, nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  }, [selectedNodeId]);

  const handleSelectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleImportTree = useCallback((jsonData: string) => {
    try {
      const importedData = JSON.parse(jsonData) as TreeData;
      // Basic validation could be added here
      setTreeData(importedData);
      setSelectedNodeId(null);
      setCollapsedNodes(new Set()); // Reset collapsed nodes on import
      toast({ title: "Success", description: "Tree imported successfully." });
    } catch (error) {
      console.error("Failed to import tree:", error);
      toast({ variant: "destructive", title: "Import Error", description: "Failed to parse JSON file." });
    }
  }, [toast]);

  const handleExportTree = useCallback((): string => {
    return JSON.stringify(treeData, null, 2);
  }, [treeData]);

  const decomposeNodeAndUpdateTree = useCallback(async (nodeId: string) => {
    const nodeToDecompose = treeData.nodes[nodeId];
    if (!nodeToDecompose) {
      toast({ variant: "destructive", title: "Error", description: "Node not found." });
      return;
    }

    setIsLoading(true);
    try {
      const input: PlanDecompositionInput = { planNodeContent: nodeToDecompose.content };
      const output: PlanDecompositionOutput = await planDecomposition(input);
      
      let currentTree = treeData;
      output.subPlans.forEach(subPlanContent => {
        const newSubNode = createNode(subPlanContent, nodeId);
        currentTree = addNodeToTree(currentTree, newSubNode);
      });
      
      currentTree = updateNodeInTree(currentTree, nodeId, { status: NodeStatus.Decomposed });
      setTreeData(currentTree);
       // If parent was collapsed, expand it
      if (collapsedNodes.has(nodeId)) {
        toggleNodeCollapse(nodeId); 
      }

      toast({ title: "Decomposition Complete", description: `${output.subPlans.length} sub-plans created.` });
    } catch (error) {
      console.error("Failed to decompose node:", error);
      toast({ variant: "destructive", title: "AI Error", description: "Failed to decompose plan." });
    } finally {
      setIsLoading(false);
    }
  }, [treeData, toast, collapsedNodes, toggleNodeCollapse]);

  const executeNodePlanAndUpdateTree = useCallback(async (nodeId: string) => {
    setIsLoading(true);
    try {
      const planToExecute: PlanForExecution = getSubTreeForExecution(treeData.nodes, nodeId) as PlanForExecution;
      if (Object.keys(planToExecute).length === 0) {
        toast({ variant: "destructive", title: "Error", description: "Cannot execute an empty plan." });
        setIsLoading(false);
        return;
      }
      
      const input: ExecutePlanInput = { plan: planToExecute, startNodeId: nodeId };
      // Mark the start node and its children as running before calling AI
      let tempTree = treeData;
      Object.keys(planToExecute).forEach(idInPlan => {
        if (tempTree.nodes[idInPlan]) {
           tempTree = updateNodeInTree(tempTree, idInPlan, { status: NodeStatus.Running });
        }
      });
      setTreeData(tempTree);


      const output: ExecutePlanOutput = await executePlan(input);
      
      let currentTree = tempTree; // Use the tree that was just updated with "Running"
      Object.entries(output).forEach(([executedNodeId, data]) => {
        if (currentTree.nodes[executedNodeId] && typeof data === 'object' && data !== null && 'status' in data) {
          const newStatus = (data as { status: NodeStatus }).status;
          currentTree = updateNodeInTree(currentTree, executedNodeId, { status: newStatus });
        }
      });
      setTreeData(currentTree);

      toast({ title: "Execution Update", description: "Plan execution statuses updated." });
    } catch (error) {
      console.error("Failed to execute plan:", error);
      toast({ variant: "destructive", title: "AI Error", description: "Failed to execute plan." });
       // Revert status if AI fails for nodes that were set to Running
      let revertTree = treeData; 
      const planToRevert: PlanForExecution = getSubTreeForExecution(treeData.nodes, nodeId) as PlanForExecution; 
      
      Object.keys(planToRevert).forEach(idInPlan => {
        const nodeBeforeAttempt = treeData.nodes[idInPlan]; 
        if (nodeBeforeAttempt && revertTree.nodes[idInPlan] && revertTree.nodes[idInPlan].status === NodeStatus.Running) {
          const originalStatus = nodeBeforeAttempt.editHistory.length > 1 && nodeBeforeAttempt.status !== NodeStatus.Running 
                               ? nodeBeforeAttempt.status 
                               : NodeStatus.Pending;
          revertTree = updateNodeInTree(revertTree, idInPlan, { status: originalStatus });
        }
      });
      setTreeData(revertTree);
    } finally {
      setIsLoading(false);
    }
  }, [treeData, toast]);

  const fetchAndSetTreeData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://72.9.144.110:8000/tasks.json', { referrerPolicy: 'no-referrer' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const fetchedTasks: FetchedTask[] = await response.json();

      const newNodes: Record<string, PlanNode> = {};
      const newRootNodeIds: string[] = [];

      for (const rootTask of fetchedTasks) {
        newRootNodeIds.push(processFetchedNodeRecursive(rootTask, null, newNodes));
      }
      
      setTreeData({ nodes: newNodes, rootNodeIds: newRootNodeIds });
      setSelectedNodeId(null); // Deselect any currently selected node
      setCollapsedNodes(new Set()); // Reset collapsed state
      toast({ title: "Data Refreshed", description: "Tasks loaded successfully from the source." });

    } catch (error) {
      console.error("Failed to fetch or process tree data:", error);
      let errorMessage = "Failed to refresh data.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({ variant: "destructive", title: "Refresh Error", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);


  return (
    <TreeContext.Provider value={{ 
      treeData, 
      selectedNodeId, 
      isLoading,
      addNode: handleAddNode, 
      updateNode: handleUpdateNode, 
      deleteNode: handleDeleteNode, 
      selectNode: handleSelectNode, 
      importTree: handleImportTree, 
      exportTree: handleExportTree,
      decomposeNodeAndUpdateTree,
      executeNodePlanAndUpdateTree,
      fetchAndSetTreeData,
      toggleNodeCollapse,
      isNodeCollapsed,
      collapsedNodes
    }}>
      {children}
    </TreeContext.Provider>
  );
};

export const useTree = (): TreeContextType => {
  const context = useContext(TreeContext);
  if (context === undefined) {
    throw new Error('useTree must be used within a TreeDataProvider');
  }
  return context;
};
