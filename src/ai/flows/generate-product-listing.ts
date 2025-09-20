'use server';

/**
 * @fileOverview AI flow for generating product content based on a photo and description.
 *
 * - generateProductListing - A function that generates product content.
 * - GenerateProductListingInput - The input type for the generateProductListing function.
 * - GenerateProductListingOutput - The return type for the generateProductListing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductListingInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  descriptionInput: z.string().describe('A short text description or voice transcription for the product.'),
});
export type GenerateProductListingInput = z.infer<typeof GenerateProductListingInputSchema>;

const GenerateProductListingOutputSchema = z.object({
  aiTitle: z.string().describe('A concise and catchy title for the product, under 10 words.'),
  aiStory: z.string().describe('A creative and compelling story or description for the product, suitable for a marketplace listing.'),
  aiPrice: z.number().describe('A suggested price for the product in Indian Rupees (₹), based on the craft, materials, and perceived value.'),
  aiTags: z.array(z.string()).describe('An array of 3-5 suggested tags or categories for search and discovery (e.g., "handmade", "ceramics", "indianart").'),
});
export type GenerateProductListingOutput = z.infer<typeof GenerateProductListingOutputSchema>;

export async function generateProductListing(input: GenerateProductListingInput): Promise<GenerateProductListingOutput> {
  return generateProductListingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductListingPrompt',
  input: {schema: GenerateProductListingInputSchema},
  output: {schema: GenerateProductListingOutputSchema},
  prompt: `You are an expert in creating compelling product listings for an e-commerce platform that sells artisan crafts from India.
Given a product photo and a basic description, generate the following:
1.  **aiTitle**: A concise and catchy title for the product, under 10 words.
2.  **aiStory**: A creative and engaging story or description that highlights the craft, cultural significance, and unique appeal. This should be a selling text.
3.  **aiPrice**: A suggested price in Indian Rupees (₹). Consider the item's likely materials, complexity, and category to suggest a fair market price.
4.  **aiTags**: An array of 3 to 5 relevant tags/keywords for search and discovery.

Product Description: {{{descriptionInput}}}
Product Photo: {{media url=photoDataUri}}
`,
});

const generateProductListingFlow = ai.defineFlow(
  {
    name: 'generateProductListingFlow',
    inputSchema: GenerateProductListingInputSchema,
    outputSchema: GenerateProductListingOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (e: any) {
      console.error('AI Generation Failed:', e.message);
      // Return placeholder data to prevent app from crashing if API is not enabled.
      // This is a temporary workaround.
      return {
        aiTitle: "AI Generation Failed: Title",
        aiStory: "The AI service is currently unavailable. Please ensure the 'Generative Language API' is enabled in your Google Cloud project. This is placeholder content.",
        aiPrice: 100,
        aiTags: ["sample", "placeholder"],
      };
    }
  }
);
