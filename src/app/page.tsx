
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { Product } from "@/lib/types";
import { getProducts } from "@/lib/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight, Brush, ShoppingCart, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');
  const storytellingImage = PlaceHolderImages.find(p => p.id === 'storytelling');
  const insightsImage = PlaceHolderImages.find(p => p.id === 'insights');

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] md:h-[90vh]">
        {heroImage && 
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            data-ai-hint={heroImage.imageHint}
            priority
          />
        }
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative container h-full flex flex-col items-center justify-end pb-16 md:pb-24 text-center">
          <h1 className="font-headline text-5xl md:text-8xl text-foreground drop-shadow-md">
            {t('appName')}
          </h1>
          <p className="mt-4 text-xl md:text-3xl font-headline text-primary drop-shadow-sm">
            {t('home_hero_title')}
          </p>
          <p className="mt-4 max-w-2xl text-base md:text-lg text-muted-foreground">
            {t('home_hero_subtitle')}
          </p>
          <Link href="/products" className="mt-8">
            <Button size="lg" className="rounded-2xl soft-shadow">
              {t('home_hero_cta')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Core Feature Sections */}
      <section className="bg-card py-16 md:py-24">
        <div className="container text-center">
             <h2 className="text-3xl md:text-4xl font-headline mb-12">Empowering Artisans, Enriching Lives</h2>
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                <Card className="rounded-2xl soft-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="text-primary"/>
                            AI-Powered Listings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Effortlessly create compelling product pages. Our AI generates catchy titles, engaging stories, fair prices, and relevant tags from just a photo and a brief description.</p>
                    </CardContent>
                </Card>
                 <Card className="rounded-2xl soft-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brush className="text-primary"/>
                            Cultural Storytelling
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Connect with customers by sharing the rich heritage behind your craft. Our platform helps you weave the cultural significance of your work into every listing.</p>
                    </CardContent>
                </Card>
                 <Card className="rounded-2xl soft-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="text-primary"/>
                            Global Marketplace
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Reach a worldwide audience. ArtVaani provides a seamless e-commerce experience for buyers to discover and purchase unique, authentic artisanal goods.</p>
                    </CardContent>
                </Card>
             </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container grid md:grid-cols-2 gap-12 items-center">
          <div>
            {insightsImage && 
              <Image
                src={insightsImage.imageUrl}
                alt={insightsImage.description}
                width={800}
                height={600}
                className="rounded-2xl object-cover aspect-video soft-shadow"
                data-ai-hint={insightsImage.imageHint}
              />
            }
          </div>
          <div>
             <h2 className="text-3xl md:text-4xl font-headline mb-4">{t('insights_explorer_title')}</h2>
             <p className="text-muted-foreground mb-6">{t('insights_explorer_desc')}</p>
             <Link href="/explore">
                <Button className="rounded-2xl soft-shadow">
                  {t('insights_explorer_cta')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
             </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
