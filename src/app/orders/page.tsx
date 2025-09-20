
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import type { Order, Review } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, PackageSearch, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ReviewForm } from '@/components/review-form';

const OrderTracker = ({ status }: { status: Order['status'] }) => {
  const statuses: Order['status'][] = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
  const currentIndex = statuses.indexOf(status);

  return (
    <div className="relative w-full py-4">
      <div className="absolute left-0 top-1/2 w-full h-0.5 bg-muted -translate-y-1/2"></div>
      <div
        className="absolute left-0 top-1/2 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500"
        style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
      ></div>
      <div className="relative flex justify-between">
        {statuses.map((s, index) => (
          <div key={s} className="flex flex-col items-center text-center">
            <div
              className={cn(
                "h-5 w-5 rounded-full bg-muted border-2 border-muted transition-colors duration-500",
                index <= currentIndex && "bg-primary border-primary"
              )}
            ></div>
            <p className={cn(
                "text-xs mt-2 text-muted-foreground transition-colors duration-500",
                index <= currentIndex && "text-primary font-semibold"
            )}>
              {s}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const RateProductButton = ({ productId }: { productId: string }) => {
    const [open, setOpen] = useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-lg">
                    <Star className="mr-2 h-4 w-4"/>
                    Rate Product
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Leave a Review</DialogTitle>
                </DialogHeader>
                <ReviewForm productId={productId} onReviewSubmitted={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}


export default function OrdersPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchOrdersAndReviews = async () => {
      try {
        const ordersCol = collection(db, 'orders');
        const q = query(ordersCol, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        let fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        fetchedOrders.sort((a, b) => b.orderDate.seconds - a.orderDate.seconds);

        // Simulate status updates for demo
        const updatedOrders = fetchedOrders.map(order => {
             const statuses: Order['status'][] = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
             if (order.status === 'Processing') {
                const randomIndex = Math.floor(Math.random() * statuses.length);
                return {...order, status: statuses[randomIndex]};
             }
             return order;
        });
        setOrders(updatedOrders);
        
        // Fetch all reviews by this user to check which products they've reviewed
        const allReviewedProductIds: string[] = [];
        if (profile?.purchasedProductIds) {
            const reviewPromises = profile.purchasedProductIds.map(pid => getDoc(doc(db, `products/${pid}/reviews/${user.uid}`)));
            const reviewDocs = await Promise.all(reviewPromises);
            const reviews = reviewDocs.filter(d => d.exists()).map(d => d.data() as Review);
            setUserReviews(reviews);
        }

      } catch (error) {
        console.error("Error fetching orders: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersAndReviews();
  }, [user, authLoading, router, profile]);

  const hasUserReviewed = (productId: string) => {
    return userReviews.some(review => review.userId === user?.uid);
  }

  if (loading || authLoading) {
    return (
      <div className="container py-12 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
       <h1 className="text-4xl md:text-5xl font-headline text-center mb-12">My Orders</h1>

        {orders.length === 0 ? (
            <div className="text-center py-16">
                <PackageSearch className="mx-auto h-24 w-24 text-muted-foreground/50" />
                <h2 className="mt-6 text-2xl font-semibold">No Orders Found</h2>
                <p className="mt-2 text-muted-foreground">You haven't placed any orders yet.</p>
            </div>
        ) : (
            <div className="space-y-8 max-w-4xl mx-auto">
                {orders.map(order => (
                    <Card key={order.id} className="rounded-2xl soft-shadow">
                        <CardHeader>
                            <CardTitle>Order ID: {order.id.substring(0, 8)}...</CardTitle>
                            <CardDescription>
                                Placed on: {new Date(order.orderDate.seconds * 1000).toLocaleDateString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                {order.items.map(item => (
                                    <div key={item.productId} className="flex justify-between items-center text-sm py-2">
                                       <div>
                                            <p>{item.title} (x{item.quantity})</p>
                                            <p className="text-muted-foreground">₹{(item.price * item.quantity).toFixed(2)}</p>
                                       </div>
                                       {!hasUserReviewed(item.productId) && <RateProductButton productId={item.productId} />}
                                    </div>
                                ))}
                                <Separator className="my-2"/>
                                <div className="flex justify-between font-semibold">
                                    <p>Total</p>
                                    <p>₹{order.totalAmount.toFixed(2)}</p>
                                </div>
                            </div>
                           
                           <div>
                             <h4 className="font-semibold mb-2">Order Status</h4>
                             <OrderTracker status={order.status}/>
                           </div>
                           
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
    </div>
  );
}
