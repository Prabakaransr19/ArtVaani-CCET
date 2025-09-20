"use client";

import Link from "next/link";
import { ShoppingBag, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "./language-switcher";

export function Header() {
  const { itemCount } = useCart();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Landmark className="h-6 w-6 text-primary" />
            <span className="inline-block font-bold text-lg">{t('appName')}</span>
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
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {t('nav_dashboard')}
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
           <LanguageSwitcher />
           <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0 text-xs">
                        {itemCount}
                    </Badge>
                )}
            </Button>
           </Link>
          <Link href="/login">
            <Button className="hidden sm:inline-flex rounded-2xl soft-shadow">{t('nav_login')}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
