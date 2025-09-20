
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Metadata } from "next";
import { Wand2, ShieldCheck, BookOpen, ShoppingBag, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Image from "next/image";
import { suggestDecorations } from "@/ai/flows/suggest-decorations";
import { useToast } from "@/hooks/use-toast";


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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setSuggestions([]);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!preview) {
        toast({variant: 'destructive', title: 'Please upload an image first.'});
        return;
    };
    setIsLoading(true);
    try {
        const result = await suggestDecorations({ photoDataUri: preview });
        setSuggestions(result.suggestions);
    } catch (error) {
        console.error("AI analysis failed:", error);
        toast({variant: 'destructive', title: 'AI Analysis Failed', description: 'Please try again later.'});
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="container py-12">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-headline">Paarvai AI</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          "Paarvai" means "vision" or "perspective." Our AI tools are designed to give you a new perspective on how to share and sell your craft, blending tradition with technology.
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto mt-12">
        <Card className="rounded-2xl soft-shadow">
            <CardHeader>
                <CardTitle className="flex items-center gap-4">
                    <ImageIcon className="h-8 w-8 text-primary" />
                    Artistic Decor Suggester
                </CardTitle>
                <CardDescription>Upload a photo of your space, and let our AI suggest artistic decorations that complement your room's style.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                    <Label htmlFor="room-photo" className="cursor-pointer">
                        {preview ? (
                             <Image src={preview} alt="Room preview" width={500} height={500} className="w-full rounded-lg object-cover aspect-video border-2 border-dashed" />
                        ) : (
                            <div className="flex items-center justify-center w-full h-64 border-2 border-dashed rounded-lg">
                                <div className="text-center text-muted-foreground">
                                    <Upload className="mx-auto h-12 w-12" />
                                    <p>Click to upload an image of your room</p>
                                </div>
                            </div>
                        )}
                    </Label>
                    <Input id="room-photo" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                    <Button onClick={handleAnalyze} disabled={isLoading || !preview} className="w-full rounded-xl soft-shadow">
                        {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                        <span className="ml-2">Analyze Space</span>
                    </Button>
                </div>
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">AI Suggestions</h3>
                    {isLoading ? (
                        <div className="space-y-2">
                           <div className="h-6 w-full bg-muted rounded-lg animate-pulse"></div>
                           <div className="h-6 w-5/6 bg-muted rounded-lg animate-pulse"></div>
                           <div className="h-6 w-full bg-muted rounded-lg animate-pulse"></div>
                        </div>
                    ) : suggestions.length > 0 ? (
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            {suggestions.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">Upload an image and click "Analyze Space" to see AI-powered decor suggestions here.</p>
                    )}
                </div>
            </CardContent>
        </Card>
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
