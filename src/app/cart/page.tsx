
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ShoppingBag, Loader2, CheckCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, writeBatch, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/lib/types";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, itemCount, loading, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (loading) {
      return (
          <div className="container py-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-muted-foreground">Loading your cart...</p>
          </div>
      );
  }
  
  const getProductTitle = (item: any) => {
    return item.aiTitle || item.title || 'Untitled';
  }
  const getProductPrice = (item: any) => {
    return item.aiPrice || item.price || 0;
  }

  const handleCheckout = async () => {
    if (!user || !profile || cart.length === 0) {
      toast({ variant: 'destructive', title: 'Cannot proceed', description: 'Your cart is empty or you are not logged in.' });
      return;
    }
    setIsProcessing(true);
    const batch = writeBatch(db);

    try {
      const orderData = {
        userId: user.uid,
        items: cart.map(item => ({
          productId: item.id,
          title: getProductTitle(item),
          price: getProductPrice(item),
          quantity: item.quantity,
        })),
        totalAmount: totalPrice,
        orderDate: serverTimestamp(),
        status: 'Processing',
      };
      
      const orderRef = doc(collection(db, 'orders'));
      batch.set(orderRef, orderData);
      
      // Add purchased product IDs to user profile
      const userDocRef = doc(db, 'users', user.uid);
      batch.update(userDocRef, {
        purchasedProductIds: arrayUnion(...cart.map(item => item.id))
      });

      // Create notifications for each artisan
      for (const item of cart) {
        const productRef = doc(db, 'products', item.id);
        const productSnap = await getDoc(productRef); // Not in batch to get artisanId
        if (productSnap.exists()) {
            const product = productSnap.data() as Product;
            const notificationRef = doc(collection(db, 'notifications'));
            batch.set(notificationRef, {
                artisanId: product.artisanId,
                orderId: orderRef.id,
                productName: getProductTitle(item),
                quantity: item.quantity,
                buyerName: profile.name,
                timestamp: serverTimestamp(),
                status: 'unread',
            });
        }
      }

      await batch.commit();
      await clearCart();
      setOrderPlaced(true);

    } catch (error) {
      console.error("Error placing order: ", error);
      toast({ variant: 'destructive', title: 'Order Failed', description: 'There was an issue placing your order.' });
    } finally {
      setIsProcessing(false);
    }
  }

  if (orderPlaced) {
    return (
        <div className="container py-12 text-center">
            <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-2xl p-8 soft-shadow">
                <CheckCircle className="mx-auto h-24 w-24 text-green-500" />
                <h2 className="mt-6 text-2xl font-semibold">Order Placed Successfully!</h2>
                <p className="mt-2 text-muted-foreground">Thank you for your purchase. You can track your order status on the orders page.</p>
                <div className="mt-8 flex justify-center gap-4">
                  <Link href="/orders">
                      <Button variant="outline" className="rounded-xl">View My Orders</Button>
                  </Link>
                  <Link href="/products">
                      <Button className="rounded-xl soft-shadow">Continue Shopping</Button>
                  </Link>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-4xl md:text-5xl font-headline text-center mb-12">Your Cart</h1>
      {cart.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground/50" />
          <h2 className="mt-6 text-2xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
          <Link href="/products" className="mt-6 inline-block">
            <Button size="lg" className="rounded-2xl soft-shadow">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.id} className="flex items-center p-4 rounded-2xl soft-shadow">
                <Image
                  src={item.imageUrl}
                  alt={getProductTitle(item)}
                  width={100}
                  height={100}
                  className="rounded-lg object-cover aspect-square"
                  data-ai-hint={item.imageHint}
                />
                <div className="flex-grow ml-4">
                  <h3 className="font-semibold">{getProductTitle(item)}</h3>
                  <p className="text-sm text-primary font-bold">₹{getProductPrice(item).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10))}
                    className="w-16 h-10 rounded-lg text-center"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <div className="md:col-span-1">
            <Card className="rounded-2xl soft-shadow sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleCheckout} disabled={isProcessing} className="w-full rounded-2xl soft-shadow" size="lg">
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
