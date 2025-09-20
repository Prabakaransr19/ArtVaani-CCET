"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wand2, Volume2, X } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { getCraftCulturalInsights, CraftCulturalInsightsOutput } from "@/ai/flows/craft-cultural-insights";
import { useTranslation } from '@/hooks/useTranslation';

type Inputs = {
  craftName: string;
};

export default function ExplorePage() {
  const [insights, setInsights] = useState<CraftCulturalInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedCraftName, setSubmittedCraftName] = useState('');
  const { lang } = useTranslation();


  const { register, handleSubmit, reset, formState: { errors } } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsLoading(true);
    setError(null);
    setInsights(null);
    setSubmittedCraftName(data.craftName);
    try {
      const result = await getCraftCulturalInsights(data);
      setInsights(result);
    } catch (e) {
      setError("Failed to generate insights. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = () => {
    if (insights && insights.culturalInsights) {
      window.speechSynthesis.cancel(); // Cancel any previous speech
      const utterance = new SpeechSynthesisUtterance(insights.culturalInsights);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleClear = () => {
    setInsights(null);
    setSubmittedCraftName('');
    reset();
  }

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-headline">Cultural Insights Explorer</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Enter the name of a craft (e.g., "Pottery", "Block Printing") to discover its rich history and cultural significance.
        </p>
      </div>

      <div className="max-w-2xl mx-auto mt-12">
        <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-4">
          <Input 
            {...register("craftName", { required: "Craft name is required" })}
            placeholder="e.g., Madhubani Painting"
            className="rounded-lg text-base"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading} className="rounded-xl soft-shadow">
            {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
            <span className="ml-2 hidden sm:inline">Discover</span>
          </Button>
        </form>
        {errors.craftName && <p className="text-destructive mt-2">{errors.craftName.message}</p>}
      </div>

      {error && (
        <div className="max-w-2xl mx-auto mt-8 text-center text-destructive">
          {error}
        </div>
      )}

      <div className="max-w-4xl mx-auto mt-12">
        {isLoading && (
          <div className="space-y-4">
             <div className="h-8 w-1/3 bg-muted rounded-lg animate-pulse"></div>
             <div className="h-6 w-full bg-muted rounded-lg animate-pulse"></div>
             <div className="h-6 w-5/6 bg-muted rounded-lg animate-pulse"></div>
             <div className="h-6 w-full bg-muted rounded-lg animate-pulse"></div>
             <div className="h-6 w-3/4 bg-muted rounded-lg animate-pulse"></div>
          </div>
        )}
        {insights && (
          <Card className="rounded-2xl soft-shadow animate-in fade-in-50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-headline text-3xl">The Story of {submittedCraftName}</CardTitle>
              <div>
                <Button variant="ghost" size="icon" onClick={handleSpeak} title="Read aloud">
                  <Volume2 />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleClear} title="Clear">
                  <X />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap leading-relaxed">{insights.culturalInsights}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
