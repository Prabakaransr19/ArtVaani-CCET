"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Mic, Square, Upload, FileImage } from 'lucide-react';
import Image from 'next/image';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';

export default function NewProductPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [descriptionInput, setDescriptionInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorderRef.current.onstop = handleStopRecording;
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Recording Error', description: 'Could not access microphone.' });
    }
  };

  const handleStopRecording = async () => {
    if (mediaRecorderRef.current) {
      setIsRecording(false);
      setIsTranscribing(true);
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        try {
          const result = await transcribeAudio({ audioDataUri: base64data });
          setDescriptionInput(prev => prev ? `${prev} ${result.transcription}` : result.transcription);
          toast({ title: "Transcription Complete!" });
        } catch (error) {
          toast({ variant: "destructive", title: "Transcription Failed" });
        } finally {
          setIsTranscribing(false);
        }
      };
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const triggerStop = () => mediaRecorderRef.current?.stop();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !descriptionInput || !user) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide an image and a description.' });
      return;
    }
    setIsSubmitting(true);
    try {
      // In a real app, upload imageFile to Firebase Storage and get URL.
      // For now, we'll use the base64 preview, which is not ideal.
      const imageUrl = preview; 
      const imageHint = imageFile.name.split('.')[0].replace(/[^a-zA-Z]/g, ' ').substring(0, 20);

      const productData = {
        artisanId: user.uid,
        imageUrl,
        imageHint,
        descriptionInput,
        aiTitle: '',
        aiStory: '',
        aiPrice: 0,
        aiTags: [],
        status: 'draft',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'products'), productData);
      
      // Also add to the user's subcollection for 'my products' view
      // const userProductsCol = collection(db, `users/${user.uid}/products`);
      // await setDoc(doc(userProductsCol, docRef.id), productData);

      toast({ title: 'Product Draft Created', description: 'Now, let\'s add the magic with AI.' });
      router.push(`/dashboard/products/edit/${docRef.id}`);

    } catch (error) {
      console.error("Error creating product draft:", error);
      toast({ variant: 'destructive', title: 'Submission Failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Create New Product</h1>
        <Button type="submit" className="rounded-xl soft-shadow" disabled={isSubmitting || !imageFile || !descriptionInput}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit for AI Analysis
        </Button>
      </div>

      <Card className="rounded-2xl soft-shadow">
        <CardHeader>
          <CardTitle>1. Upload Your Product</CardTitle>
          <CardDescription>Start by providing a photo and a basic description of your craft.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Product Photo</Label>
            <Input id="photo" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            <Label htmlFor="photo" className="cursor-pointer">
              {preview ? (
                <Image src={preview} alt="Product preview" width={400} height={400} className="w-full rounded-lg object-cover aspect-square border-2 border-dashed" />
              ) : (
                <div className="flex items-center justify-center w-full h-80 border-2 border-dashed rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <Upload className="mx-auto h-12 w-12" />
                    <p>Click to upload or drag & drop</p>
                  </div>
                </div>
              )}
            </Label>
          </div>

          {/* Description Input */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description (Text or Voice)</Label>
              <Textarea
                id="description"
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                rows={10}
                placeholder="Briefly describe your product. What is it? What materials did you use? What makes it special?"
                className="rounded-lg mt-2"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            {isRecording ? (
              <Button type="button" variant="destructive" className="w-full rounded-lg" onClick={triggerStop}>
                <Square className="mr-2 h-4 w-4" /> Stop Recording
              </Button>
            ) : (
              <Button type="button" variant="outline" className="w-full rounded-lg" onClick={handleStartRecording} disabled={isTranscribing}>
                {isTranscribing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mic className="mr-2 h-4 w-4" />}
                {isTranscribing ? 'Transcribing...' : 'Record with Voice'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
