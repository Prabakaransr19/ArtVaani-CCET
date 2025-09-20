
"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"
import { db } from "@/lib/firebase";
import { Order, Product } from "@/lib/types";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

type RecentSale = {
    productTitle: string;
    productImage: string;
    customerName: string; // We don't have this yet, so we'll fake it.
    customerEmail: string; // We don't have this yet, so we'll fake it.
    price: number;
    date: Date;
}

export function RecentSales() {
    const { user } = useAuth();
    const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentSales = async () => {
            if (!user) return;
            setLoading(true);

            // 1. Get artisan's products
            const productsQuery = query(collection(db, 'products'), where('artisanId', '==', user.uid));
            const productsSnapshot = await getDocs(productsQuery);
            const artisanProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            const artisanProductIds = artisanProducts.map(p => p.id);

            // 2. Get all orders
            const ordersQuery = query(collection(db, 'orders'));
            const ordersSnapshot = await getDocs(ordersQuery);
            const allOrders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

            // 3. Filter orders to find sales for this artisan
            const sales: RecentSale[] = [];
            for (const order of allOrders) {
                for (const item of order.items) {
                    if (artisanProductIds.includes(item.productId)) {
                        const product = artisanProducts.find(p => p.id === item.productId);
                        if (product) {
                            sales.push({
                                productTitle: item.title,
                                productImage: product.imageUrl,
                                // Faking customer data for now
                                customerName: `Customer ${order.userId.substring(0, 5)}`,
                                customerEmail: `customer-${order.userId.substring(0,5)}@example.com`,
                                price: item.price * item.quantity,
                                date: order.orderDate.toDate()
                            });
                        }
                    }
                }
            }
            
            // 4. Sort by date and take the last 5
            sales.sort((a, b) => b.date.getTime() - a.date.getTime());
            setRecentSales(sales.slice(0, 5));
            setLoading(false);
        }

        fetchRecentSales();
    }, [user]);

    if (loading) {
        return <p>Loading sales...</p>;
    }

    if (recentSales.length === 0) {
        return <p className="text-sm text-muted-foreground">You have no recent sales.</p>;
    }

    const chartData = recentSales.map(sale => ({
        name: sale.productTitle.substring(0,10) + '...',
        total: sale.price,
    })).reverse(); // Reverse for chronological order in chart

  return (
    <div className="space-y-8">
       <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${value}`}
          />
          <Bar
            dataKey="total"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      {recentSales.map((sale, index) => (
        <div key={index} className="flex items-center">
            <Avatar className="h-9 w-9">
                <AvatarImage src={sale.productImage} alt="Product Image" />
                <AvatarFallback>{sale.productTitle.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{sale.productTitle}</p>
                <p className="text-sm text-muted-foreground">Sold to {sale.customerName}</p>
            </div>
            <div className="ml-auto font-medium">+₹{sale.price.toFixed(2)}</div>
        </div>
      ))}
    </div>
  )
}
