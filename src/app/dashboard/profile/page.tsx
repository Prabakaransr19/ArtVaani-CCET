
"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  city: z.string().min(2, 'City is required.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  // Fetch profile data
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          setProfile(data);
          setValue('name', data.name);
          setValue('city', data.city);
        }
      };
      fetchProfile();
    }
  }, [user, setValue]);

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
    if(profile && !profile.verified) {
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
    if (!user || !profile || !videoRef.current || !canvasRef.current) {
        toast({variant: 'destructive', title: 'Prerequisites missing', description: 'User, profile or camera not ready.'});
        return;
    }
    setIsVerifying(true);

    // 1. Capture photo
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    const photoDataUri = canvas.toDataURL('image/jpeg');

    // 2. Get location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            const input: VerifyArtisanIdentityInput = {
                userId: user.uid,
                photoDataUri,
                location: { latitude, longitude }
            };
            const result = await verifyArtisanIdentity(input);

            if (result.verified) {
                await setDoc(doc(db, 'users', user.uid), { verified: true }, { merge: true });
                setProfile(prev => prev ? {...prev, verified: true} : null);
                toast({ title: "Verification Successful!", description: "You are now a verified artisan." });
            } else {
                toast({ variant: 'destructive', title: "Verification Failed", description: result.reason });
            }
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: "Verification Error", description: "An unexpected error occurred during verification." });
        } finally {
            setIsVerifying(false);
        }
      }, 
      (error) => {
          console.error("Geolocation error:", error);
          toast({ variant: 'destructive', title: 'Location Error', description: 'Could not get your location. Please enable location services.' });
          setIsVerifying(false);
      }
    );
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8"/></div>;
  if (!profile) return <div className="flex justify-center items-center h-screen">Loading profile...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        {profile.verified && (
            <div className="flex items-center gap-2 text-green-600 bg-green-100 px-4 py-2 rounded-full">
                <UserCheck className="h-5 w-5"/>
                <span className="font-semibold">Verified Artisan</span>
            </div>
        )}
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
          {profile.verified ? (
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
                <div className="relative">
                  <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                  <canvas ref={canvasRef} className="hidden"></canvas>
                  {hasCameraPermission === false && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                        <Alert variant="destructive" className="w-auto">
                            <ShieldAlert className="h-4 w-4" />
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                                Please allow camera access to use this feature.
                            </AlertDescription>
                        </Alert>
                     </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                    Position your face clearly in the camera frame. We will capture a single photo and your current location to verify against your profile.
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
}
