
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { DollarSign, ShoppingBasket, Loader2, PackageCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@/lib/types";
import { RecentSales } from "@/components/recent-sales";

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [productCount, setProductCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [salesCount, setSalesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // 1. Fetch artisan's products
      const productsQuery = query(collection(db, 'products'), where('artisanId', '==', user.uid));
      const productsSnapshot = await getDocs(productsQuery);
      const artisanProductIds = productsSnapshot.docs.map(doc => doc.id);
      setProductCount(productsSnapshot.size);
      
      // 2. Fetch all orders and calculate revenue and sales
      const ordersCol = collection(db, 'orders');
      const ordersSnapshot = await getDocs(ordersCol);
      const ordersList = ordersSnapshot.docs.map(doc => doc.data() as Order);

      let revenue = 0;
      let sales = 0;
      ordersList.forEach(order => {
        order.items.forEach(item => {
          if (artisanProductIds.includes(item.productId)) {
            revenue += item.price * item.quantity;
            sales += item.quantity;
          }
        });
      });
      setTotalRevenue(revenue);
      setSalesCount(sales);

    } catch (error) {
      console.error("Error fetching dashboard counts:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not load dashboard data." });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if(user) {
        fetchDashboardData();
    }
  }, [user, toast]);


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-8">Welcome to your Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl soft-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>}
            <p className="text-xs text-muted-foreground">
              Total earnings from all sales
            </p>
          </CardContent>
        </Card>
         <Card className="rounded-2xl soft-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">+{salesCount}</div>}
            <p className="text-xs text-muted-foreground">
              Number of products sold
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl soft-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listed Products</CardTitle>
            <ShoppingBasket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{productCount}</div>}
            <p className="text-xs text-muted-foreground">
              Your active listings
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-8 md:grid-cols-1">
        <Card className="rounded-2xl soft-shadow" id="sales">
            <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
                <RecentSales />
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
