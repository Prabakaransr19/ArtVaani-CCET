
"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ForArtisansPage() {
  const { user, loading, profile, fetchProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onApply = async () => {
    if (!user || !profile) return;
    setIsSubmitting(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      // Update the user's role to 'artisan'
      await setDoc(userDocRef, { 
        role: 'artisan',
       }, { merge: true });
      
      await fetchProfile(); // Re-fetch profile to update context

      toast({ title: "Application Submitted!", description: "Welcome! You now have access to the artisan dashboard." });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Submission Failed", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return (
        <div className="container py-12 text-center">
            <h1 className="text-4xl font-headline">Become an ArtVaani Artisan</h1>
            <p className="mt-4 text-lg text-muted-foreground">Please log in or create an account to apply.</p>
            <Link href="/login" className="mt-6 inline-block">
                <Button size="lg" className="rounded-2xl soft-shadow">Login</Button>
            </Link>
        </div>
    )
  }

  if (profile?.role === 'artisan') {
    return (
        <div className="container py-12 text-center">
            <h1 className="text-4xl font-headline">Welcome, Artisan!</h1>
            <p className="mt-4 text-lg text-muted-foreground">You already have access to the artisan dashboard.</p>
            <Link href="/dashboard" className="mt-6 inline-block">
                <Button size="lg" className="rounded-2xl soft-shadow">Go to Dashboard</Button>
            </Link>
        </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="soft-shadow rounded-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-headline">Become an Artisan</CardTitle>
              <CardDescription>Join our community and share your craft with the world.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground">
                    By applying, you'll gain access to the Artisan Dashboard where you can list products, share your stories, and connect with a global audience.
                </p>
            </CardContent>
            <CardFooter>
              <Button onClick={onApply} className="w-full rounded-xl soft-shadow" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Apply to be an Artisan
              </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
