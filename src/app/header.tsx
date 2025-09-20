
"use client";

import Link from "next/link";
import { ShoppingBag, User, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const { itemCount } = useCart();
  const { t } = useTranslation();
  const { user, profile, loading } = useAuth();
  const scrollDirection = useScrollDirection();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    auth.signOut();
  }
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <header className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm transition-transform duration-300",
        scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'
    )}>
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-8 w-auto text-primary" />
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link
              href="/products"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {t('nav_products')}
            </Link>
            <Link
              href="/explore"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {t('nav_explore')}
            </Link>
            <Link
              href="/for-artisans"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              For Artisans
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {!isMounted ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-24 rounded-md"/>
              <Skeleton className="h-8 w-20 rounded-md"/>
              <Skeleton className="h-8 w-20 rounded-md"/>
            </div>
          ) : (
            <>
              <LanguageSwitcher />
              <Link href="/cart">
                <Button variant="ghost" className="relative">
                    <ShoppingBag className="h-5 w-5" />
                    <span className="ml-2 hidden sm:inline">Cart</span>
                    {itemCount > 0 && (
                        <Badge variant="destructive" className="absolute top-0 right-0 h-5 w-5 justify-center p-0 text-xs">
                            {itemCount}
                        </Badge>
                    )}
                </Button>
              </Link>
              {loading ? null : user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                                <AvatarFallback>{getInitials(profile?.name || user.displayName)}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{profile?.name || user.displayName}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          {profile?.role === 'artisan' && (
                            <Link href="/dashboard">
                                <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Dashboard</span>
                                </DropdownMenuItem>
                            </Link>
                          )}
                           <Link href="/orders">
                                <DropdownMenuItem>
                                    <Package className="mr-2 h-4 w-4" />
                                    <span>My Orders</span>
                                </DropdownMenuItem>
                            </Link>
                        </DropdownMenuGroup>
                         <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                             <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button className="hidden sm:inline-flex rounded-2xl soft-shadow">{t('nav_login')}</Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
