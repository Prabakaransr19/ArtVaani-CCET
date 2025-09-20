
"use client";

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { refineArtisanStory } from '@/ai/flows/refine-artisan-story';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, Mic, Square } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const storySchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  rawTranscript: z.string().min(20, 'Transcription must be at least 20 characters.'),
  finalStory: z.string().optional(),
});

type StoryFormValues = z.infer<typeof storySchema>;

export default function NewStoryPage() {
  const [isRefining, setIsRefining] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<StoryFormValues>({
    resolver: zodResolver(storySchema)
  });

  const rawTranscript = watch('rawTranscript');

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = handleStopRecording;
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({ variant: 'destructive', title: 'Recording Error', description: 'Could not access microphone. Please check permissions.' });
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
                setValue('rawTranscript', result.transcription);
                toast({ title: "Transcription Complete!", description: "Your story has been transcribed."});
            } catch (error) {
                console.error("Error transcribing audio:", error);
                toast({ variant: "destructive", title: "Transcription Failed", description: "Could not transcribe audio. Please try again."});
            } finally {
                setIsTranscribing(false);
            }
        };
        // Stop the media stream tracks
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const triggerStop = () => {
    mediaRecorderRef.current?.stop();
  }

  const handleRefine = async () => {
    if (!rawTranscript) {
      toast({ variant: "destructive", title: "Please provide a transcription first."});
      return;
    }
    
    setIsRefining(true);
    try {
        const result = await refineArtisanStory({ transcription: rawTranscript });
        setValue('finalStory', result.refinedStory);
    } catch (error) {
        console.error("Failed to refine story:", error);
        toast({ variant: "destructive", title: "AI refinement failed", description: "Please try again."});
    } finally {
        setIsRefining(false);
    }
  };

  const onSubmit = async (data: StoryFormValues) => {
    if (!user) {
        toast({ variant: 'destructive', title: "Not Authenticated", description: "You must be logged in to save a story."});
        return;
    }
    setIsSaving(true);
    try {
        const finalStory = data.finalStory || data.rawTranscript;

        const userProductsCol = collection(db, `users/${user.uid}/products`);
        const q = query(userProductsCol, orderBy("createdAt", "desc"), limit(1));
        const productSnapshot = await getDocs(q);
        
        let productId = "";
        if (!productSnapshot.empty) {
            productId = productSnapshot.docs[0].id;
        }

        const batch = writeBatch(db);

        const storyData = {
            title: data.title,
            artisanId: user.uid,
            productId: productId,
            rawTranscript: data.rawTranscript,
            finalStory: finalStory,
            createdAt: serverTimestamp(),
        };

        const publicStoryRef = doc(collection(db, 'stories'));
        batch.set(publicStoryRef, storyData);
        
        const userStoryRef = doc(collection(db, `users/${user.uid}/stories`));
        batch.set(userStoryRef, storyData);


        if (productId) {
            const productDoc = productSnapshot.docs[0];
            const publicProductRef = doc(db, 'products', productDoc.id);

            batch.update(productDoc.ref, { story: finalStory, storyId: publicStoryRef.id });
            batch.update(publicProductRef, { story: finalStory, storyId: publicStoryRef.id });
            
            await batch.commit();
            toast({ title: "Story Saved!", description: "Your new story has been published and linked to your latest product."});
        } else {
             await batch.commit();
             toast({ title: "Story Saved!", description: "Your new story has been published. Create a product to link it.", variant: 'default' });
        }

        router.push('/dashboard/stories');

    } catch (error) {
        console.error("Error saving story:", error);
        toast({ variant: "destructive", title: "Save Failed", description: "Could not save the story. Please try again."});
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">New Artisan Story</h1>
        <Button type="submit" className="rounded-xl soft-shadow" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Story
        </Button>
      </div>
      
      <Card className="rounded-2xl soft-shadow">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Story Title</Label>
                <Input id="title" {...register('title')} placeholder="e.g., The Legacy of Our Family's Weaving" className="rounded-lg"/>
                {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-start">
                <div className="space-y-2">
                    <Label htmlFor="rawTranscript">Your Story Transcription</Label>
                    <CardDescription>
                        Record your story and our AI will transcribe it for you.
                    </CardDescription>
                    <Textarea 
                        id="rawTranscript" 
                        {...register('rawTranscript')} 
                        rows={15} 
                        placeholder="Start with 'Hello, my name is...' and tell us about your craft, your family, and your culture. Your transcribed text will appear here."
                        className="rounded-lg"
                    />
                     {errors.rawTranscript && <p className="text-destructive text-sm">{errors.rawTranscript.message}</p>}
                    
                    {isRecording ? (
                      <Button type="button" variant="destructive" className="w-full rounded-lg mt-2" onClick={triggerStop}>
                          <Square className="mr-2 h-4 w-4" />
                          Stop Recording
                      </Button>
                    ) : (
                      <Button type="button" variant="secondary" className="w-full rounded-lg mt-2" onClick={handleStartRecording} disabled={isTranscribing}>
                          {isTranscribing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Mic className="mr-2 h-4 w-4"/>}
                          {isTranscribing ? 'Transcribing...' : 'Start Recording'}
                      </Button>
                    )}
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <div>
                            <Label htmlFor="finalStory">AI-Refined Story</Label>
                            <CardDescription>Click "Refine with AI" to improve your story.</CardDescription>
                        </div>
                        <Button type="button" onClick={handleRefine} disabled={isRefining || !rawTranscript} className="rounded-xl">
                            {isRefining ? <Loader2 className="animate-spin mr-2"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                            Refine
                        </Button>
                    </div>
                    <Textarea 
                        id="finalStory" 
                        {...register('finalStory')} 
                        rows={15} 
                        placeholder="AI-generated story will appear here..." 
                        className="rounded-lg bg-primary/5 border-primary/20"
                    />
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
