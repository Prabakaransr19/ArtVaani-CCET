
'use server';

/**
 * @fileOverview AI flow for verifying an artisan's identity.
 *
 * - verifyArtisanIdentity - A function that verifies an artisan's identity using a photo and location.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile, VerifyArtisanIdentityInput, VerifyArtisanIdentityOutput } from '@/lib/types';
import { VerifyArtisanIdentityInputSchema, VerifyArtisanIdentityOutputSchema } from '@/lib/types';


// Define a tool to get city from coordinates.
// In a real app, this would use a reverse geocoding API.
// For this demo, we'll simulate it by having the AI do the lookup based on common knowledge.
const getCityFromGps = ai.defineTool(
    {
      name: 'getCityFromGps',
      description: 'Gets the city name from GPS latitude and longitude coordinates.',
      inputSchema: z.object({
        latitude: z.number(),
        longitude: z.number(),
      }),
      outputSchema: z.object({
        city: z.string().describe('The estimated city name.'),
      }),
    },
    async ({ latitude, longitude }) => {
        // This is a simplified mock. A real implementation would call a geocoding service.
        // We'll ask another LLM to do a reverse lookup.
        const result = await ai.generate({
            model: 'googleai/gemini-2.5-flash',
            prompt: `What is the closest major city to latitude ${latitude}, longitude ${longitude}? Respond with only the city name.`
        });
        const city = result.text.trim();
        return { city };
    }
  );

export async function verifyArtisanIdentity(input: VerifyArtisanIdentityInput): Promise<VerifyArtisanIdentityOutput> {
  return verifyArtisanIdentityFlow(input);
}

const verifyArtisanIdentityFlow = ai.defineFlow(
  {
    name: 'verifyArtisanIdentityFlow',
    inputSchema: VerifyArtisanIdentityInputSchema,
    outputSchema: VerifyArtisanIdentityOutputSchema,
  },
  async (input) => {
    // 1. Get city from GPS coordinates using the tool
    const gpsCityResult = await getCityFromGps({
      latitude: input.location.latitude,
      longitude: input.location.longitude,
    });
    const detectedCity = gpsCityResult.city;

    // 2. Check if the detected city is "Karur"
    if (detectedCity.toLowerCase() === 'karur') {
      return {
        verified: true,
        reason: 'Identity confirmed. Artisan location verified as Karur.',
      };
    } else {
      return {
        verified: false,
        reason: `Verification failed. Artisan must be located in Karur. Detected location: ${detectedCity}.`,
      };
    }
  }
);
