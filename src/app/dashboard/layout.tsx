
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ShoppingBasket, User, ShieldAlert, DollarSign, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Notifications } from "@/components/notifications";
import { ArtistStatusBadge } from "@/components/artist-status-badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const NavLinks = ({ isSheet = false }: { isSheet?: boolean }) => {
  const pathname = usePathname();
  const { profile } = useAuth();

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/products", label: "My Products", icon: ShoppingBasket },
    { href: "/dashboard#sales", label: "Sales", icon: DollarSign },
    { href: "/dashboard/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="flex flex-col space-y-2">
      {menuItems.map((item) => (
        <Link href={item.href} key={item.href}>
          <Button
            variant={pathname === item.href ? "default" : "ghost"}
            className="w-full justify-start rounded-xl"
          >
            <item.icon className="mr-2" />
            {item.label}
          </Button>
        </Link>
      ))}
      <div className={cn("p-4 mt-4 border-t", isSheet && "pt-4 border-t-0")}>
        {profile?.verificationStatus === 'verified' ? (
          <ArtistStatusBadge status={profile.verificationStatus} />
        ) : (
          <Link href="/dashboard/profile">
            <Button variant="outline" className="w-full justify-start text-amber-600 border-amber-300 hover:bg-amber-50 rounded-xl">
              <ShieldAlert className="mr-2" /> Verify ID
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
};


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, profile } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (!profile) {
      router.push('/profile-setup');
      return;
    }

    if (profile.role !== 'artisan') {
      router.push('/for-artisans');
      return;
    }
  }, [user, profile, loading, router]);


  if (loading || !profile || profile.role !== 'artisan' || !isClient) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading your dashboard...</p>
      </div>
    );
  }
  
  const MobileNav = () => (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle className="sr-only">Dashboard Menu</SheetTitle>
        </SheetHeader>
        <NavLinks isSheet={true} />
      </SheetContent>
    </Sheet>
  );
  
  const DesktopNav = () => (
      <aside className="md:col-span-1">
        <NavLinks />
      </aside>
  );

  return (
    <div className="container py-8">
      <div className="flex justify-between md:justify-end mb-4">
        {isMobile && <MobileNav />}
        <Notifications />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {!isMobile && <DesktopNav />}
        <main className="md:col-span-3">
          {children}
        </main>
      </div>
    </div>
  );
}
