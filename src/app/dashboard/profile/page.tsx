
"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, MapPin, UserCheck, ShieldAlert } from 'lucide-react';
import type { UserProfile, VerifyArtisanIdentityInput } from '@/lib/types';
import { verifyArtisanIdentity } from '@/ai/flows/verify-artisan-identity';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ArtistStatusBadge } from '@/components/artist-status-badge';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  city: z.string().min(2, 'City is required.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, loading, profile: authProfile, fetchProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(authProfile);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  // Sync auth profile to local state
  useEffect(() => {
    setProfile(authProfile);
    if(authProfile){
        setValue('name', authProfile.name);
        setValue('city', authProfile.city);
    }
  }, [authProfile, setValue]);
  

  // Request camera permission
  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };
    if(profile && profile.verificationStatus !== 'verified') {
        getCameraPermission();
    }
    // Cleanup function to stop video stream
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [profile, toast]);


  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), { 
          name: data.name,
          city: data.city,
       }, { merge: true });
      toast({ title: "Profile Updated!" });
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Update Failed", description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerification = async () => {
    if (!user || !profile) {
        toast({variant: 'destructive', title: 'Profile not loaded'});
        return;
    }
    setIsVerifying(true);

    const performVerification = async (coords: GeolocationCoordinates | null) => {
        try {
            const userDocRef = doc(db, 'users', user.uid);
            let updateData: any = {};

            if (coords) {
                updateData.lastKnownCoords = {
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                };
                updateData.lastVerifiedAt = serverTimestamp();
            }

            const isKarur = profile.city.toLowerCase() === 'karur';
            const newStatus = isKarur ? 'verified' : 'flagged';
            updateData.verificationStatus = newStatus;

            await setDoc(userDocRef, updateData, { merge: true });
            
            // Manually update profile state before context re-fetches
            setProfile(prev => prev ? {...prev, verificationStatus: newStatus} : null);

            if (isKarur) {
                toast({ title: "Verification Successful!", description: "You are now a verified artisan." });
            } else {
                toast({ variant: 'destructive', title: "Verification Failed", description: `Location not matching` });
            }
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: "Verification Error", description: "An unexpected error occurred during verification." });
        } finally {
            setIsVerifying(false);
        }
    };

    navigator.geolocation.getCurrentPosition(
        (position) => {
            performVerification(position.coords);
        },
        (error) => {
            console.log("Error fetching location:", error.message);
            toast({variant: 'destructive', title: 'Could not get location', description: 'Location permission may be denied. Proceeding without location data.'});
            performVerification(null);
        }
    );
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8"/></div>;
  if (!profile) return <div className="flex justify-center items-center h-screen">Loading profile...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <ArtistStatusBadge status={profile.verificationStatus} />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
            <Card className="rounded-2xl soft-shadow">
                <form onSubmit={handleSubmit(onSubmit)}>
                <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>Update your name and city.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" {...register('name')} className="rounded-lg" />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" {...register('city')} className="rounded-lg" />
                        {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full rounded-xl soft-shadow" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardFooter>
                </form>
            </Card>
        </div>

        <div className="md:col-span-2">
          {profile.verificationStatus === 'verified' ? (
            <Card className="rounded-2xl soft-shadow bg-green-50 border-green-200">
                <CardHeader>
                    <CardTitle>Identity Verified</CardTitle>
                    <CardDescription>Your identity has been successfully verified. Thank you for helping us build a trusted community.</CardDescription>
                </CardHeader>
            </Card>
          ) : (
            <Card className="rounded-2xl soft-shadow">
              <CardHeader>
                <CardTitle>Identity Verification</CardTitle>
                <CardDescription>To ensure authenticity, please complete this one-time verification step.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.verificationStatus === 'flagged' && (
                    <Alert variant="destructive">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Verification Failed</AlertTitle>
                        <AlertDescription>
                           Location not matching
                        </AlertDescription>
                    </Alert>
                )}
                <div className="relative">
                  <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                  <canvas ref={canvasRef} className="hidden"></canvas>
                  {hasCameraPermission === false && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                        <Alert variant="destructive" className="w-auto">
                            <ShieldAlert className="h-4 w-4" />
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                                A live photo is still used as a mock-up for verification. Please allow camera access.
                            </AlertDescription>
                        </Alert>
                     </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                    Your identity will be verified based on the city in your profile. You must be in 'Karur'. A photo is still captured for our records.
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={handleVerification} disabled={isVerifying || !hasCameraPermission} className="w-full rounded-xl soft-shadow">
                  {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                   Capture & Verify
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

    

    

    