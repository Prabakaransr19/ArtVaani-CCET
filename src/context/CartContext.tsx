
"use client";

import type { CartItem, Product, UserProfile, UserCartItem } from '@/lib/types';
import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { getProductById } from '@/lib/products';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  totalPrice: number;
  loading: boolean;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userCart, setUserCart] = useState<UserCartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const updateUserCartInFirestore = async (newCart: UserCartItem[]) => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { cart: newCart }, { merge: true });
    }
  };

  const fetchCartDetails = useCallback(async (cartItems: UserCartItem[]) => {
    setLoading(true);
    const detailedCart: CartItem[] = [];
    for (const item of cartItems) {
      const product = await getProductById(item.productId);
      if (product) {
        detailedCart.push({ ...product, quantity: item.quantity });
      }
    }
    setCart(detailedCart);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data() as UserProfile;
          const currentUserCart = userData.cart || [];
          setUserCart(currentUserCart);
          fetchCartDetails(currentUserCart);
        } else {
          setCart([]);
          setUserCart([]);
          setLoading(false);
        }
      });
      return () => unsubscribe();
    } else {
      setCart([]);
      setUserCart([]);
      setLoading(false);
    }
  }, [user, authLoading, fetchCartDetails]);


  const addToCart = useCallback(
    async (product: Product, quantity: number = 1) => {
      if (!user) return;
      
      const existingItem = userCart.find((item) => item.productId === product.id);
      let newCart: UserCartItem[];

      if (existingItem) {
        newCart = userCart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...userCart, { productId: product.id, quantity }];
      }
      await updateUserCartInFirestore(newCart);
    },
    [user, userCart]
  );

  const removeFromCart = useCallback(async (productId: string) => {
    if (!user) return;
    const newCart = userCart.filter((item) => item.productId !== productId);
    await updateUserCartInFirestore(newCart);
  }, [user, userCart]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (!user) return;
    let newCart: UserCartItem[];
    if (quantity <= 0) {
      newCart = userCart.filter(item => item.productId !== productId);
    } else {
      newCart = userCart.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
    }
    await updateUserCartInFirestore(newCart);
  }, [user, userCart]);

  const clearCart = useCallback(async () => {
    if (!user) return;
    await updateUserCartInFirestore([]);
  }, [user]);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const getProductPrice = (item: CartItem) => item.aiPrice || item.price || 0;

  const totalPrice = cart.reduce(
    (sum, item) => sum + getProductPrice(item) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        totalPrice,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
