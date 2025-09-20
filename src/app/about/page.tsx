
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'About Us | ArtVaani',
};

export default function AboutPage() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <Card className="rounded-2xl soft-shadow">
          <CardHeader>
            <CardTitle className="text-4xl font-headline text-center">About Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              ArtVaani is a modern platform dedicated to empowering traditional artisans by connecting them with a global audience. Our mission is to preserve cultural heritage while providing artisans with powerful digital tools powered by AI.
            </p>
            <p>
              Through ArtVaani, buyers can discover unique, authentic handmade products and the cultural stories behind them, while artisans gain visibility, fair opportunities, and a space to thrive in today’s digital economy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
