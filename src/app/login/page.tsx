"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc } from "firebase/firestore";
import { Logo } from "@/components/logo";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="24px"
        height="24px"
        {...props}
      >
        <path
          fill="#FFC107"
          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        />
        <path
          fill="#FF3D00"
          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
        />
        <path
          fill="#1976D2"
          d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.902,35.619,44,29.5,44,24C44,22.659,43.862,21.35,43.611,20.083z"
        />
      </svg>
    )
  }

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const checkUserProfile = async (userId: string) => {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.role === 'artisan') {
          router.push('/dashboard');
      } else {
          router.push('/products');
      }
    } else {
      router.push('/profile-setup');
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Login Successful", description: "Welcome back!" });
      await checkUserProfile(userCredential.user.uid);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      toast({ title: "Google Sign-In Successful"});
      await checkUserProfile(result.user.uid);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Google Sign-In Failed", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePhoneSignIn = async () => {
    setIsLoading(true);
    try {
      if (!isOtpSent) {
        // Ensure recaptcha is only rendered once
        if (!(window as any).recaptchaVerifier) {
          (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': (response: any) => {
              // reCAPTCHA solved, allow signInWithPhoneNumber.
            }
          });
        }
        
        const appVerifier = (window as any).recaptchaVerifier;
        const result = await signInWithPhoneNumber(auth, `+${phoneNumber}`, appVerifier);
        setConfirmationResult(result);
        setIsOtpSent(true);
        toast({ title: "OTP Sent", description: "Please check your phone." });
      } else {
        if (!confirmationResult) {
            throw new Error("Something went wrong with phone auth.");
        }
        const userCredential = await confirmationResult.confirm(otp);
        toast({ title: "Phone Sign-In Successful" });
        await checkUserProfile(userCredential.user.uid);
      }
    } catch(error: any) {
        toast({ variant: "destructive", title: "Phone Sign-In Failed", description: error.message });
        setIsOtpSent(false); // Reset on error
    } finally {
        setIsLoading(false);
    }
  }


  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] py-12 px-4">
      <div id="recaptcha-container"></div>
      <Card className="w-full max-w-md soft-shadow rounded-2xl">
        <CardHeader className="text-center space-y-4">
          <Logo className="h-12 w-auto mx-auto" />
          <CardTitle className="text-3xl font-headline">Welcome Back</CardTitle>
          <CardDescription>Login to continue to ArtVaani</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {!isOtpSent ? (
            <>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="artisan@example.com" className="rounded-lg" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" className="rounded-lg" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button className="w-full rounded-xl soft-shadow" onClick={handleLogin} disabled={isLoading || !email || !password}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Login with Email
                </Button>
            </>
            ) : (
                <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input id="otp" type="text" placeholder="123456" className="rounded-lg" value={otp} onChange={(e) => setOtp(e.target.value)} />
                </div>
            )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <div className="space-y-4 w-full">
            <Button variant="outline" className="rounded-xl w-full" onClick={handleGoogleSignIn}>
                <GoogleIcon className="mr-2" /> Google
            </Button>
            <div className="flex gap-2 w-full">
                <Input type="tel" placeholder="911234567890" className="rounded-lg" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={isOtpSent}/>
                <Button variant="outline" className="rounded-xl" onClick={handlePhoneSignIn} disabled={isLoading || (!phoneNumber && !isOtpSent)}>
                  <Phone className="mr-2 h-4 w-4"/> {isOtpSent ? 'Verify' : 'Send OTP'}
                </Button>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground pt-4">
            Don't have an account?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
