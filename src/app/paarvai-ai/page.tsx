
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Metadata } from "next";
import { Wand2, ShieldCheck, BookOpen, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: 'Paarvai AI | ArtVaani',
    description: 'Explore the AI-powered features that make ArtVaani unique.',
};

const features = [
    {
        icon: ShoppingBag,
        title: "AI Product Generation",
        description: "Upload a photo and let our AI create a compelling title, story, price, and tags for your product.",
        href: "/dashboard/products/new",
        cta: "Create a Listing"
    },
    {
        icon: BookOpen,
        title: "Cultural Insights",
        description: "Discover the rich history and cultural significance behind any craft with our AI-powered explorer.",
        href: "/explore",
        cta: "Explore Crafts"
    },
    {
        icon: Wand2,
        title: "Artisan Story Refinement",
        description: "Record your story and our AI will help refine it into a beautiful narrative for your customers.",
        href: "/dashboard/stories/new",
        cta: "Tell Your Story"
    },
    {
        icon: ShieldCheck,
        title: "Identity Verification",
        description: "Our AI assists in verifying artisan identities, building a trusted and authentic marketplace.",
        href: "/dashboard/profile",
        cta: "Verify Your ID"
    }
]

export default function PaarvaiAiPage() {
  return (
    <div className="container py-12">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-headline">Paarvai AI</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          "Paarvai" means "vision" or "perspective." Our AI tools are designed to give you a new perspective on how to share and sell your craft, blending tradition with technology.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto">
        {features.map((feature) => (
            <Card key={feature.title} className="rounded-2xl soft-shadow">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <feature.icon className="h-8 w-8 text-primary" />
                        <CardTitle>{feature.title}</CardTitle>
                    </div>
                    <CardDescription className="pt-2">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href={feature.href}>
                        <Button variant="outline" className="w-full rounded-xl">
                            {feature.cta}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
