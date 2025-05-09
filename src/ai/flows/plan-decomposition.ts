// The use server directive is necessary here because we'll be calling
// genkit flows from React Server Components.
'use server';

/**
 * @fileOverview Implements the plan decomposition flow.
 *
 * - planDecomposition - Decomposes a given plan node into smaller, actionable sub-plans.
 * - PlanDecompositionInput - The input type for the planDecomposition function.
 * - PlanDecompositionOutput - The return type for the planDecomposition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PlanDecompositionInputSchema = z.object({
  planNodeContent: z
    .string()
    .describe('The content of the plan node to decompose.'),
});
export type PlanDecompositionInput = z.infer<typeof PlanDecompositionInputSchema>;

const PlanDecompositionOutputSchema = z.object({
  subPlans: z
    .array(z.string())
    .describe('An array of sub-plans decomposed from the original plan node.'),
});
export type PlanDecompositionOutput = z.infer<typeof PlanDecompositionOutputSchema>;

export async function planDecomposition(input: PlanDecompositionInput): Promise<PlanDecompositionOutput> {
  return planDecompositionFlow(input);
}

const planDecompositionPrompt = ai.definePrompt({
  name: 'planDecompositionPrompt',
  input: {schema: PlanDecompositionInputSchema},
  output: {schema: PlanDecompositionOutputSchema},
  prompt: `You are a planning expert. Decompose the following plan node into smaller, actionable sub-plans.

Plan Node Content: {{{planNodeContent}}}

Return the sub-plans as a JSON array of strings.  Each subplan should be a concise and actionable step.
`,
});

const planDecompositionFlow = ai.defineFlow(
  {
    name: 'planDecompositionFlow',
    inputSchema: PlanDecompositionInputSchema,
    outputSchema: PlanDecompositionOutputSchema,
  },
  async input => {
    const {output} = await planDecompositionPrompt(input);
    return output!;
  }
);
