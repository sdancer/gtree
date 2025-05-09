import { NodeStatus, type PlanNode, type TreeData, type EditRecord } from '@/types';

export function generateNodeId(): string {
  return crypto.randomUUID();
}

export function createNode(
  content: string,
  parentId: string | null = null,
  status: NodeStatus = NodeStatus.Pending
): PlanNode {
  const now = new Date().toISOString();
  return {
    id: generateNodeId(),
    content,
    parentId,
    childrenIds: [],
    status,
    editHistory: [{ timestamp: now, content }],
    createdAt: now,
    updatedAt: now,
  };
}

export function getSubTreeForExecution(
  allNodes: Record<string, PlanNode>,
  startNodeId: string
): Record<string, Partial<PlanNode>> {
  const subTreeNodes: Record<string, Partial<PlanNode>> = {};
  const queue: string[] = [startNodeId];
  const visited: Set<string> = new Set();

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const node = allNodes[currentId];
    if (node) {
      // Pass only essential data for execution, especially status
      subTreeNodes[currentId] = {
        id: node.id,
        content: node.content, // LLM might need content for context
        status: node.status,
        parentId: node.parentId,
        childrenIds: [...node.childrenIds], // Pass children structure
      };
      node.childrenIds.forEach(childId => {
        if (!visited.has(childId)) {
          queue.push(childId);
        }
      });
    }
  }
  return subTreeNodes;
}

export function addNodeToTree(treeData: TreeData, node: PlanNode): TreeData {
  const newNodes = { ...treeData.nodes, [node.id]: node };
  let newRootNodeIds = [...treeData.rootNodeIds];

  if (node.parentId) {
    const parent = newNodes[node.parentId];
    if (parent) {
      newNodes[node.parentId] = {
        ...parent,
        childrenIds: [...parent.childrenIds, node.id],
        updatedAt: new Date().toISOString(),
      };
    }
  } else {
    if (!newRootNodeIds.includes(node.id)) {
      newRootNodeIds.push(node.id);
    }
  }
  return { nodes: newNodes, rootNodeIds: newRootNodeIds };
}

export function updateNodeInTree(treeData: TreeData, nodeId: string, updates: Partial<Omit<PlanNode, 'id' | 'parentId' | 'childrenIds' | 'createdAt'>> & { content?: string }): TreeData {
  const existingNode = treeData.nodes[nodeId];
  if (!existingNode) return treeData;

  const now = new Date().toISOString();
  let newEditHistory = existingNode.editHistory;
  if (updates.content && updates.content !== existingNode.content) {
    newEditHistory = [...existingNode.editHistory, { timestamp: now, content: existingNode.content }];
    // Keep history to a reasonable limit, e.g., 10 versions
    if (newEditHistory.length > 10) {
      newEditHistory.shift(); 
    }
  }
  
  const updatedNode: PlanNode = {
    ...existingNode,
    ...updates,
    editHistory: newEditHistory,
    updatedAt: now,
  };

  return {
    ...treeData,
    nodes: {
      ...treeData.nodes,
      [nodeId]: updatedNode,
    },
  };
}

// Basic delete, does not currently handle re-parenting children or deep deletion.
// For a full app, this would need to be more robust.
export function deleteNodeFromTree(treeData: TreeData, nodeId: string): TreeData {
  const nodeToDelete = treeData.nodes[nodeId];
  if (!nodeToDelete) return treeData;

  const newNodes = { ...treeData.nodes };
  delete newNodes[nodeId];

  let newRootNodeIds = treeData.rootNodeIds.filter(id => id !== nodeId);

  if (nodeToDelete.parentId && newNodes[nodeToDelete.parentId]) {
    const parent = newNodes[nodeToDelete.parentId];
    newNodes[nodeToDelete.parentId] = {
      ...parent,
      childrenIds: parent.childrenIds.filter(id => id !== nodeId),
      updatedAt: new Date().toISOString(),
    };
  }
  
  // Recursively delete children (optional, could also orphan them or re-parent)
  const childrenToDelete = [...nodeToDelete.childrenIds];
  let resultTreeData = { nodes: newNodes, rootNodeIds: newRootNodeIds};
  childrenToDelete.forEach(childId => {
    resultTreeData = deleteNodeFromTree(resultTreeData, childId);
  });


  return resultTreeData;
}
