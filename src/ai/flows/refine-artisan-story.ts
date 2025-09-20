'use server';
/**
 * @fileOverview This file defines a Genkit flow for refining artisan stories.
 *
 * - refineArtisanStory - A function that refines an artisan's recorded story into a well-written narrative.
 * - RefineArtisanStoryInput - The input type for the refineArtisanStory function.
 * - RefineArtisanStoryOutput - The return type for the refineArtisanStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineArtisanStoryInputSchema = z.object({
  transcription: z
    .string()
    .describe("The artisan's transcribed voice recording of their cultural story."),
});
export type RefineArtisanStoryInput = z.infer<typeof RefineArtisanStoryInputSchema>;

const RefineArtisanStoryOutputSchema = z.object({
  refinedStory: z
    .string()
    .describe('The refined and well-written narrative of the artisan story.'),
});
export type RefineArtisanStoryOutput = z.infer<typeof RefineArtisanStoryOutputSchema>;

export async function refineArtisanStory(
  input: RefineArtisanStoryInput
): Promise<RefineArtisanStoryOutput> {
  return refineArtisanStoryFlow(input);
}

const refineArtisanStoryPrompt = ai.definePrompt({
  name: 'refineArtisanStoryPrompt',
  input: {schema: RefineArtisanStoryInputSchema},
  output: {schema: RefineArtisanStoryOutputSchema},
  prompt: `You are an expert storyteller specializing in crafting compelling narratives from transcribed voice recordings.

  Refine the following artisan's story into a well-written and engaging narrative that captures the essence of their craft and cultural background. The tone should be authentic and heartfelt.

  Transcription: {{{transcription}}}
  `,
});

const refineArtisanStoryFlow = ai.defineFlow(
  {
    name: 'refineArtisanStoryFlow',
    inputSchema: RefineArtisanStoryInputSchema,
    outputSchema: RefineArtisanStoryOutputSchema,
  },
  async input => {
    const {output} = await refineArtisanStoryPrompt(input);
    return output!;
  }
);
