
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, writeBatch, getDocs, orderBy } from "firebase/firestore";
import type { Notification } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function timeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

export function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const q = query(
        collection(db, "notifications"), 
        where("artisanId", "==", user.uid),
        orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(fetchedNotifications);
      const unread = fetchedNotifications.filter(n => n.status === 'unread').length;
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [user]);

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    const batch = writeBatch(db);
    const q = query(
        collection(db, "notifications"), 
        where("artisanId", "==", user.uid),
        where("status", "==", "unread")
    );
    const snapshot = await getDocs(q);
    snapshot.forEach(doc => {
      batch.update(doc.ref, { status: "read" });
    });
    await batch.commit();
  };


  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card className="border-none shadow-none">
            <CardHeader className="flex-row items-center justify-between p-4">
                <CardTitle className="text-lg">Notifications</CardTitle>
                {unreadCount > 0 && (
                    <Button variant="link" size="sm" onClick={handleMarkAllAsRead} className="p-0 h-auto">Mark all as read</Button>
                )}
            </CardHeader>
            <Separator/>
            <CardContent className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(notif => (
                        <div key={notif.id} className="flex items-start gap-4">
                           <div className="bg-primary/10 text-primary p-2 rounded-full">
                               <ShoppingCart className="h-5 w-5"/>
                           </div>
                           <div className="flex-1">
                                <p className="text-sm">
                                    New order for <strong>{notif.productName}</strong> (x{notif.quantity}) from <strong>{notif.buyerName}</strong>.
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {notif.timestamp ? timeAgo(notif.timestamp.toDate()) : ''}
                                </p>
                           </div>
                           {notif.status === 'unread' && <div className="h-2 w-2 rounded-full bg-primary mt-1.5"></div>}
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No notifications yet.</p>
                )}
            </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
