// plan-execution.ts
'use server';

/**
 * @fileOverview Executes plans or subplans in sequence using GenAI, recording the execution status of each node.
 *
 * - executePlan - A function to execute a plan and update the status of each node.
 * - ExecutePlanInput - The input type for the executePlan function, including the plan and the node to start from.
 * - ExecutePlanOutput - The return type for the executePlan function, containing the updated plan.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExecutePlanInputSchema = z.object({
  plan: z.record(z.any()).describe('The plan to execute, represented as a hierarchical structure.'),
  startNodeId: z.string().optional().describe('The ID of the node to start execution from. If not provided, starts from the root.'),
});
export type ExecutePlanInput = z.infer<typeof ExecutePlanInputSchema>;

const ExecutePlanOutputSchema = z.record(z.any()).describe('The updated plan with execution statuses recorded for each node.');
export type ExecutePlanOutput = z.infer<typeof ExecutePlanOutputSchema>;

export async function executePlan(input: ExecutePlanInput): Promise<ExecutePlanOutput> {
  return executePlanFlow(input);
}

const planExecutionPrompt = ai.definePrompt({
  name: 'planExecutionPrompt',
  input: {schema: ExecutePlanInputSchema},
  output: {schema: ExecutePlanOutputSchema},
  prompt: `You are an AI agent responsible for executing a given plan.

The plan is represented as a JSON object where each key is a node ID and each value is the node's details, including its status.

Your task is to execute the plan step-by-step, starting from the specified node (or the root if none is specified).

For each node, you must:

1.  Determine the action to be performed based on the node's content (e.g., a description or instruction).
2.  Execute the action. This might involve calling external tools or APIs (described separately) or simply updating the node's status.
3.  Record the execution status in the plan. Possible statuses include "pending", "running", "completed", "failed", etc.
4.  If the node has children (sub-plans), recursively execute them.

Return the updated plan with the execution statuses recorded for each node.

Here is the plan:

{{{plan}}}

Start Node ID: {{{startNodeId}}}
`,
});

const executePlanFlow = ai.defineFlow(
  {
    name: 'executePlanFlow',
    inputSchema: ExecutePlanInputSchema,
    outputSchema: ExecutePlanOutputSchema,
  },
  async input => {
    const {output} = await planExecutionPrompt(input);
    return output!;
  }
);
