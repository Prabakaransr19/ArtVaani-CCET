
'use server';

/**
 * @fileOverview AI flow for verifying an artisan's identity.
 *
 * - verifyArtisanIdentity - A function that verifies an artisan's identity using a photo and location.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
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

const verifyArtisanIdentityPrompt = ai.definePrompt({
    name: 'verifyArtisanIdentityPrompt',
    tools: [getCityFromGps],
    input: { schema: z.object({
        profileCity: z.string(),
        photoDataUri: z.string(),
        latitude: z.number(),
        longitude: z.number(),
    })},
    output: { schema: VerifyArtisanIdentityOutputSchema },
    prompt: `You are an identity verification agent for an artisan marketplace. Your task is to verify an artisan's identity based on a photo and their location.

    An artisan has provided a live photo and their current GPS location. Their profile states they are from '{{{profileCity}}}'.

    Here is the photo:
    {{media url=photoDataUri}}

    Follow these steps:
    1.  Use the 'getCityFromGps' tool to determine the city from the artisan's current GPS coordinates (latitude: {{{latitude}}}, longitude: {{{longitude}}}).
    2.  Compare the city from the GPS with the city in their profile ('{{{profileCity}}}').
    3.  Analyze the background of the provided photo. Does the environment seem consistent with the location? (e.g., architecture, flora, general environment).
    4.  Make a final decision. The verification is successful ONLY IF the GPS-derived city matches the profile city AND the photo background is plausible for that location.

    If verification fails, provide a clear reason.
    - If cities do not match, state that "Location mismatch: GPS indicates [GPS City] but profile is set to [Profile City]."
    - If the photo background seems inconsistent, state that "The photo background does not appear to be consistent with the provided location."
    - If both fail, mention both reasons.

    If verification is successful, set 'verified' to true and the reason to "Identity confirmed."
    `,
});


const verifyArtisanIdentityFlow = ai.defineFlow(
  {
    name: 'verifyArtisanIdentityFlow',
    inputSchema: VerifyArtisanIdentityInputSchema,
    outputSchema: VerifyArtisanIdentityOutputSchema,
  },
  async (input) => {
    // 1. Fetch user profile to get their city
    const userDocRef = doc(db, 'users', input.userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
        return { verified: false, reason: "User profile not found." };
    }
    const userProfile = userDoc.data() as UserProfile;
    const profileCity = userProfile.city;

    // 2. Call the LLM with the tool
    const { output } = await verifyArtisanIdentityPrompt({
        profileCity: profileCity,
        photoDataUri: input.photoDataUri,
        latitude: input.location.latitude,
        longitude: input.location.longitude,
    });

    if (!output) {
      // This can happen if the model fails to produce a structured response.
      // We'll return a failure and log the issue.
      console.error("Verification flow failed: AI model returned null output.");
      return { verified: false, reason: "AI model failed to process the verification request. Please try again." };
    }

    return output;
  }
);
