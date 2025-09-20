
import { Product, Review, ReviewStats } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, query, where, orderBy, writeBatch, serverTimestamp, runTransaction } from 'firebase/firestore';

// Function to fetch all PUBLISHED products from Firestore
export async function getProducts(): Promise<Product[]> {
  try {
    const productsCol = collection(db, 'products');
    const q = query(productsCol, where('status', '==', 'published'));
    const productsSnapshot = await getDocs(q);
    const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    return productsList;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// Function to fetch a single product by its ID
export async function getProductById(id: string): Promise<Product | null> {
    try {
        const productDocRef = doc(db, 'products', id);
        const productDoc = await getDoc(productDocRef);

        if (productDoc.exists()) {
            return { id: productDoc.id, ...productDoc.data() } as Product;
        } else {
            console.warn(`Product with ID ${id} not found.`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        return null;
    }
}


// Function to fetch products for a specific user from Firestore
export async function getMyProducts(userId: string): Promise<Product[]> {
    if (!userId) return [];
    try {
        const productsCol = collection(db, `products`);
        const q = query(productsCol, where('artisanId', '==', userId));
        const productsSnapshot = await getDocs(q);
        const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        return productsList;
    } catch (error) {
        console.error("Error fetching user products:", error);
        return [];
    }
}

export async function submitReview(
  productId: string,
  review: Omit<Review, 'id' | 'createdAt'>
) {
  const productRef = doc(db, 'products', productId);
  const reviewRef = doc(collection(productRef, 'reviews'), review.userId);

  try {
    await runTransaction(db, async (transaction) => {
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists()) {
        throw 'Product does not exist!';
      }

      // Set the new review
      transaction.set(reviewRef, { ...review, createdAt: serverTimestamp() });

      // Calculate new average rating and count
      const reviewsCol = collection(productRef, 'reviews');
      // In a real transaction, we'd fetch previous reviews to calculate, but for simplicity:
      const currentData = productDoc.data();
      const oldReviewCount = currentData.reviewCount || 0;
      const oldAverageRating = currentData.averageRating || 0;
      
      const newReviewCount = oldReviewCount + 1;
      const newAverageRating = (oldAverageRating * oldReviewCount + review.rating) / newReviewCount;

      // Update the product document
      transaction.update(productRef, {
        reviewCount: newReviewCount,
        averageRating: newAverageRating,
      });
    });
  } catch (error) {
    console.error("Error submitting review: ", error);
    throw error;
  }
}
