
"use client";
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { TreeData, PlanNode, PlanForExecution, FetchedTask } from '@/types';
import { NodeStatus } from '@/types'; // Imported NodeStatus as a value
import { createNode, addNodeToTree, updateNodeInTree, deleteNodeFromTree, getSubTreeForExecution } from '@/lib/planUtils';
import { planDecomposition, type PlanDecompositionInput, type PlanDecompositionOutput } from '@/ai/flows/plan-decomposition';
import { executePlan, type ExecutePlanInput, type ExecutePlanOutput } from '@/ai/flows/plan-execution';
import { useToast } from '@/hooks/use-toast';
import sampleData from '@/samples/test1.json'; // Import the local JSON data

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
  fetchAndSetTreeData: () => Promise<void>; // This will still fetch from remote URL
  toggleNodeCollapse: (nodeId: string) => void;
  isNodeCollapsed: (nodeId: string) => boolean;
  collapsedNodes: Set<string>;
}

const TreeContext = createContext<TreeContextType | undefined>(undefined);

// Recursive helper to transform fetched tasks into PlanNode structure
function processFetchedNodeRecursive(
  fetchedNode: FetchedTask,
  parentId: string | null,
  nodesAccumulator: Record<string, PlanNode>
): string {
  const nodeId = fetchedNode.uid;
  const fetchedContent = fetchedNode.content?.trim();
  const planNodeContent = fetchedNode.title + (fetchedContent ? `\n${fetchedContent}` : '');

  const childrenIds: string[] = [];
  if (fetchedNode.children && fetchedNode.children.length > 0) {
    for (const childFetchedNode of fetchedNode.children) {
      childrenIds.push(processFetchedNodeRecursive(childFetchedNode, nodeId, nodesAccumulator));
    }
  }

  let planStatus = NodeStatus.Pending; // Default status
  if (fetchedNode.status) {
    switch (fetchedNode.status.toLowerCase()) {
      case 'done':
        planStatus = NodeStatus.Completed;
        break;
      case 'in progress':
        planStatus = NodeStatus.Running;
        break;
      case 'blocked':
        planStatus = NodeStatus.Failed; // Mapping "Blocked" to "Failed"
        break;
      case 'pending':
        planStatus = NodeStatus.Pending;
        break;
      default:
        // Log unhandled status or keep as Pending
        console.warn(`Unhandled status: ${fetchedNode.status} for node ${nodeId}`);
        planStatus = NodeStatus.Pending;
    }
  }

  const now = new Date().toISOString();
  nodesAccumulator[nodeId] = {
    id: nodeId,
    content: planNodeContent,
    parentId: parentId,
    childrenIds: childrenIds,
    status: planStatus,
    editHistory: [{ timestamp: now, content: planNodeContent }],
    createdAt: now,
    updatedAt: now,
  };
  return nodeId;
}

// Helper to initialize with data from the imported JSON
function getInitialData(): TreeData {
  const newNodes: Record<string, PlanNode> = {};
  const newRootNodeIds: string[] = [];
  const fetchedTasks: FetchedTask[] = sampleData as FetchedTask[];

  for (const rootTask of fetchedTasks) {
    newRootNodeIds.push(processFetchedNodeRecursive(rootTask, null, newNodes));
  }
  
  if (newRootNodeIds.length === 0 && Object.keys(newNodes).length === 0) {
    // Fallback if sampleData is empty or processing fails, create a default node
    const fallbackNode = createNode("My First Plan", null);
    return {
      nodes: { [fallbackNode.id]: fallbackNode },
      rootNodeIds: [fallbackNode.id],
    };
  }
  
  return { nodes: newNodes, rootNodeIds: newRootNodeIds };
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
    if (parentId && collapsedNodes.has(parentId)) {
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
      const importedTasks = JSON.parse(jsonData) as FetchedTask[]; // Expecting an array of FetchedTask
      const newNodes: Record<string, PlanNode> = {};
      const newRootNodeIds: string[] = [];
      for (const rootTask of importedTasks) {
        newRootNodeIds.push(processFetchedNodeRecursive(rootTask, null, newNodes));
      }
      setTreeData({ nodes: newNodes, rootNodeIds: newRootNodeIds });
      setSelectedNodeId(null);
      setCollapsedNodes(new Set());
      toast({ title: "Success", description: "Tree imported successfully." });
    } catch (error) {
      console.error("Failed to import tree:", error);
      toast({ variant: "destructive", title: "Import Error", description: "Failed to parse JSON file. Expected an array of tasks." });
    }
  }, [toast]);

  const handleExportTree = useCallback((): string => {
    // Export in the same FetchedTask structure for consistency, if desired,
    // or export the internal TreeData structure. Current export is TreeData.
    // For now, keeping the export as internal TreeData structure.
    return JSON.stringify(treeData, null, 2);
  }, [treeData]);

  const decomposeNodeAndUpdateTree = useCallback(async (nodeId: string) => {
    const nodeToDecompose = treeData.nodes[nodeId];
    if (!nodeToDecompose) {
      toast({ variant: "destructive", title: "Error", description: "Node not found." });
      return;
    }

    setIsLoading(true);
    handleSelectNode(nodeId); // Use handleSelectNode directly
    try {
      const input: PlanDecompositionInput = { planNodeContent: nodeToDecompose.content };
      // Optimistically set status to Running
      setTreeData(currentTreeData => updateNodeInTree(currentTreeData, nodeId, { status: NodeStatus.Running }));

      const output: PlanDecompositionOutput = await planDecomposition(input);
      
      let currentTree = treeData; // Get latest tree data
      // Fetch the updated tree data that includes the "Running" status
      setTreeData(prevTreeData => {
        currentTree = prevTreeData; // Ensure currentTree is the one with "Running" status
        output.subPlans.forEach(subPlanContent => {
          const newSubNode = createNode(subPlanContent, nodeId);
          currentTree = addNodeToTree(currentTree, newSubNode);
        });
        currentTree = updateNodeInTree(currentTree, nodeId, { status: NodeStatus.Decomposed });
        return currentTree;
      });
      
      if (collapsedNodes.has(nodeId)) {
        toggleNodeCollapse(nodeId); 
      }

      toast({ title: "Decomposition Complete", description: `${output.subPlans.length} sub-plans created.` });
    } catch (error) {
      console.error("Failed to decompose node:", error);
      setTreeData(currentTreeData => updateNodeInTree(currentTreeData, nodeId, { status: NodeStatus.Failed })); // Revert to Failed on error
      toast({ variant: "destructive", title: "AI Error", description: "Failed to decompose plan." });
    } finally {
      setIsLoading(false);
    }
  }, [treeData, toast, collapsedNodes, toggleNodeCollapse, handleSelectNode]);

  const executeNodePlanAndUpdateTree = useCallback(async (nodeId: string) => {
    setIsLoading(true);
    handleSelectNode(nodeId); // Use handleSelectNode directly
    let originalStatuses: Record<string, NodeStatus> = {};

    try {
      const planToExecute: PlanForExecution = getSubTreeForExecution(treeData.nodes, nodeId) as PlanForExecution;
      if (Object.keys(planToExecute).length === 0) {
        toast({ variant: "destructive", title: "Error", description: "Cannot execute an empty plan." });
        setIsLoading(false);
        return;
      }
      
      // Store original statuses and set to Running
      setTreeData(currentTreeData => {
        let tempTree = { ...currentTreeData };
        Object.keys(planToExecute).forEach(idInPlan => {
          if (tempTree.nodes[idInPlan]) {
            originalStatuses[idInPlan] = tempTree.nodes[idInPlan].status; // Store original
            tempTree = updateNodeInTree(tempTree, idInPlan, { status: NodeStatus.Running });
          }
        });
        return tempTree;
      });

      const input: ExecutePlanInput = { plan: getSubTreeForExecution(treeData.nodes, nodeId) as PlanForExecution, startNodeId: nodeId }; // Ensure the plan sent to AI reflects "Running"
      const output: ExecutePlanOutput = await executePlan(input);
      
      setTreeData(currentTreeData => {
        let updatedTree = { ...currentTreeData };
        Object.entries(output).forEach(([executedNodeId, data]) => {
          if (updatedTree.nodes[executedNodeId] && typeof data === 'object' && data !== null && 'status' in data) {
            const newStatus = (data as { status: NodeStatus }).status;
            updatedTree = updateNodeInTree(updatedTree, executedNodeId, { status: newStatus });
          }
        });
        return updatedTree;
      });

      toast({ title: "Execution Update", description: "Plan execution statuses updated." });
    } catch (error) {
      console.error("Failed to execute plan:", error);
      // Revert to original statuses on error
      setTreeData(currentTreeData => {
         let revertTree = { ...currentTreeData };
         Object.keys(originalStatuses).forEach(idInPlan => {
           if (revertTree.nodes[idInPlan] && originalStatuses[idInPlan]) {
             revertTree = updateNodeInTree(revertTree, idInPlan, { status: originalStatuses[idInPlan] });
           } else if (revertTree.nodes[idInPlan]) {
             // If somehow original status wasn't captured but node was set to running, set to failed
             revertTree = updateNodeInTree(revertTree, idInPlan, { status: NodeStatus.Failed });
           }
         });
         return revertTree;
      });
      toast({ variant: "destructive", title: "AI Error", description: "Failed to execute plan." });
    } finally {
      setIsLoading(false);
    }
  }, [treeData, toast, handleSelectNode]);

  const fetchAndSetTreeData = useCallback(async () => { // This still fetches from remote for "Refresh"
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
      setSelectedNodeId(null); 
      setCollapsedNodes(new Set()); 
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


    