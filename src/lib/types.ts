
import { FieldValue, Timestamp } from 'firebase/firestore';
import { z } from 'zod';

export type ArtistVerificationStatus = 'verified' | 'pending' | 'flagged';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  reviewText: string;
  createdAt: Timestamp;
}

export interface ReviewStats {
  averageRating: number;
  reviewCount: number;
}


export interface Product {
  id: string;
  artisanId: string;
  imageUrl: string;
  imageHint: string;
  descriptionInput: string;
  aiTitle: string;
  aiStory: string;
  aiPrice: number;
  aiTags: string[];
  status: 'draft' | 'published';
  createdAt: Timestamp; // Changed from FieldValue for easier client-side sorting
  updatedAt: Timestamp; // Changed from FieldValue
  // Merging old fields for compatibility, can be cleaned up later.
  title?: string;
  description?: string;
  price?: number;
  hashtags?: string[] | string;
  // review fields
  averageRating?: number;
  reviewCount?: number;
  reviews?: any[];

  sellerDetails?: any;
}


export interface CartItem extends Product {
  quantity: number;
}

export interface UserCartItem {
  productId: string;
  quantity: number;
}

export interface UserProfile {
    uid: string;
    name: string;
    email: string | null;
    city: string;
    phone: string;
    role: 'buyer' | 'artisan';
    verificationStatus: ArtistVerificationStatus;
    cart: UserCartItem[];
    purchasedProductIds?: string[];
    profileImage: string;
    lastKnownCoords?: {
        latitude: number;
        longitude: number;
    };
    lastVerifiedAt?: FieldValue;
}

export interface Story {
    id: string;
    title: string;
    artisanId: string;
    productId: string;
    rawTranscript: string;
    finalStory: string;
    createdAt: FieldValue;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  orderDate: Timestamp;
  status: 'Processing' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered';
}


export const VerifyArtisanIdentityInputSchema = z.object({
    userId: z.string().describe("The ID of the user to verify."),
    photoDataUri: z.string().describe("A photo of the artisan, as a data URI."),
    location: z.object({
        latitude: z.number(),
        longitude: z.number(),
    }),
});
export type VerifyArtisanIdentityInput = z.infer<typeof VerifyArtisanIdentityInputSchema>;

export const VerifyArtisanIdentityOutputSchema = z.object({
    verified: z.boolean().describe('Whether the identity was successfully verified.'),
    reason: z.string().describe('The reason for the verification decision.'),
});
export type VerifyArtisanIdentityOutput = z.infer<typeof VerifyArtisanIdentityOutputSchema>;

export interface Notification {
    id: string;
    artisanId: string;
    orderId: string;
    productName: string;
    quantity: number;
    buyerName: string;
    timestamp: Timestamp;
    status: 'read' | 'unread';
}
