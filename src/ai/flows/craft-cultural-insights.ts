'use server';

/**
 * @fileOverview Flow for providing detailed write-ups about the history and cultural significance of crafts.
 *
 * - getCraftCulturalInsights - A function that retrieves cultural insights for a given craft.
 * - CraftCulturalInsightsInput - The input type for the getCraftCulturalInsights function.
 * - CraftCulturalInsightsOutput - The return type for the getCraftCulturalInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const CraftCulturalInsightsInputSchema = z.object({
  craftName: z.string().describe('The name of the craft to get cultural insights for.'),
});

export type CraftCulturalInsightsInput = z.infer<typeof CraftCulturalInsightsInputSchema>;

const CraftCulturalInsightsOutputSchema = z.object({
  culturalInsights: z.string().describe('Detailed write-up about the history and cultural significance of the craft.'),
});

export type CraftCulturalInsightsOutput = z.infer<typeof CraftCulturalInsightsOutputSchema>;

export async function getCraftCulturalInsights(input: CraftCulturalInsightsInput): Promise<CraftCulturalInsightsOutput> {
  return craftCulturalInsightsFlow(input);
}

const craftCulturalInsightsPrompt = ai.definePrompt({
  name: 'craftCulturalInsightsPrompt',
  input: {schema: CraftCulturalInsightsInputSchema},
  output: {schema: CraftCulturalInsightsOutputSchema},
  prompt: `Provide a detailed write-up about the history, cultural significance, and traditions associated with the following craft: {{{craftName}}}.`,
});

const craftCulturalInsightsFlow = ai.defineFlow(
  {
    name: 'craftCulturalInsightsFlow',
    inputSchema: CraftCulturalInsightsInputSchema,
    outputSchema: CraftCulturalInsightsOutputSchema,
  },
  async input => {
    const {output} = await craftCulturalInsightsPrompt(input);
    return output!;
  }
);
