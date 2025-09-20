
'use server';

/**
 * @fileOverview An AI flow for suggesting artistic decorations for a room.
 *
 * - suggestDecorations - A function that suggests decorations based on an image.
 * - SuggestDecorationsInput - The input type for the suggestDecorations function.
 * - SuggestDecorationsOutput - The return type for the suggestDecorations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestDecorationsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a room, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SuggestDecorationsInput = z.infer<typeof SuggestDecorationsInputSchema>;

const SuggestDecorationsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of 3-4 artistic decoration suggestions suitable for the room in the image.'),
});
export type SuggestDecorationsOutput = z.infer<typeof SuggestDecorationsOutputSchema>;


export async function suggestDecorations(input: SuggestDecorationsInput): Promise<SuggestDecorationsOutput> {
  return suggestDecorationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDecorationsPrompt',
  input: { schema: SuggestDecorationsInputSchema },
  output: { schema: SuggestDecorationsOutputSchema },
  prompt: `You are an expert interior designer with a keen eye for artisanal and handcrafted art.
Analyze the provided image of a room. Pay attention to the dominant colors, existing furniture, style (e.g., modern, traditional, minimalist), and the overall mood.

Based on your analysis, suggest 3-4 specific types of artistic decorations from Indian artisans that would complement the space well. For each suggestion, briefly explain why it would be a good fit.

Room Photo: {{media url=photoDataUri}}
`,
});


const suggestDecorationsFlow = ai.defineFlow(
  {
    name: 'suggestDecorationsFlow',
    inputSchema: SuggestDecorationsInputSchema,
    outputSchema: SuggestDecorationsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
