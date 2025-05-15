
export enum NodeStatus {
  Pending = 'pending',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
  Decomposed = 'decomposed',
}

export interface EditRecord {
  timestamp: string; // ISO date string
  content: string;
}

export interface PlanNode {
  id: string;
  content: string; // Markdown content
  parentId: string | null;
  childrenIds: string[];
  status: NodeStatus;
  editHistory: EditRecord[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  // For visual layout - can be extended if a graphical tree is implemented
  position?: { x: number; y: number }; 
}

export interface TreeData {
  nodes: Record<string, PlanNode>;
  rootNodeIds: string[];
}

// For GenAI flow compatibility, the plan object is Record<string, any>
// Our PlanNode should be serializable to fit this structure, 
// primarily ensuring `status` is part of the `any`.
export type PlanExecutionNodeData = Partial<PlanNode> & { status: NodeStatus };
export type PlanForExecution = Record<string, PlanExecutionNodeData>;

// Type for the structure of tasks fetched from the external URL
export interface FetchedTask {
  uid: string;
  title: string;
  content: string;
  children: FetchedTask[];
}
