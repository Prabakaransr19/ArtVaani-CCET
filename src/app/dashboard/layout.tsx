
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ShoppingBasket, User, ShieldAlert, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Notifications } from "@/components/notifications";
import { ArtistStatusBadge } from "@/components/artist-status-badge";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading, profile } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (loading) return; // Wait for auth state to load

    if (!user) {
      router.push('/login'); // Not logged in, redirect to login
      return;
    }
    
    if (!profile) {
      // If no profile, redirect to setup
      router.push('/profile-setup');
      return;
    }
    
    if (profile.role !== 'artisan') {
      // If not an artisan, redirect away from dashboard
      router.push('/for-artisans');
      return;
    }

  }, [user, profile, loading, router]);


  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/products", label: "My Products", icon: ShoppingBasket },
    { href: "/dashboard#sales", label: "Sales", icon: DollarSign },
    { href: "/dashboard/profile", label: "Profile", icon: User },
  ];

  if (loading || !profile || profile.role !== 'artisan') {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <p>Loading your dashboard...</p>
        </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-end mb-4">
        <Notifications />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="md:col-span-1">
              <nav className="flex flex-col space-y-2">
                  {menuItems.map((item) => (
                      <Link href={item.href} key={item.href}>
                         <Button 
                           variant={pathname === item.href ? "default" : "ghost"}
                           className="w-full justify-start rounded-xl"
                         >
                            <item.icon className="mr-2"/>
                            {item.label}
                         </Button>
                      </Link>
                  ))}
                   <div className="p-4 mt-4 border-t">
                    {profile.verificationStatus === 'verified' ? (
                      <ArtistStatusBadge status={profile.verificationStatus} />
                    ) : (
                       <Link href="/dashboard/profile">
                          <Button variant="outline" className="w-full justify-start text-amber-600 border-amber-300 hover:bg-amber-50 rounded-xl">
                            <ShieldAlert className="mr-2"/> Verify ID
                         </Button>
                       </Link>
                    )}
                  </div>
              </nav>
          </aside>
          <main className="md:col-span-3">
            {children}
          </main>
      </div>
    </div>
  );
}
