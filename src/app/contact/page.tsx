
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Contact Us | ArtVaani',
};

export default function ContactPage() {
  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="rounded-2xl soft-shadow text-center">
          <CardHeader>
            <CardTitle className="text-4xl font-headline">Contact Us</CardTitle>
            <CardDescription>
                For questions, feedback, or support, please reach out to us.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a 
              href="mailto:theteamvantablack@gmail.com" 
              className="inline-flex items-center gap-4 text-xl font-semibold text-primary hover:underline"
            >
              <Mail />
              theteamvantablack@gmail.com
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
