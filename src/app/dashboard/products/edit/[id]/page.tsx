
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';

import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { generateProductListing } from '@/ai/flows/generate-product-listing';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Wand2, Trash2, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


const productSchema = z.object({
  aiTitle: z.string().min(1, 'Title is required.'),
  aiStory: z.string().min(1, 'Story is required.'),
  aiPrice: z.coerce.number().min(1, 'Price must be greater than 0.'),
  aiTags: z.array(z.object({ value: z.string().min(1, 'Tag cannot be empty.') })).min(1, 'At least one tag is required.'),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { register, control, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
        aiTitle: '',
        aiStory: '',
        aiPrice: 0,
        aiTags: [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "aiTags",
  });

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        setIsLoading(true);
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const productData = docSnap.data() as Product;
          setProduct(productData);
          reset({
            aiTitle: productData.aiTitle,
            aiStory: productData.aiStory,
            aiPrice: productData.aiPrice,
            aiTags: productData.aiTags?.map(t => ({ value: t })) || [],
          });
          
          if(productData.status === 'draft' && !productData.aiStory) {
              handleGenerate(productData);
          }

        } else {
          toast({ variant: 'destructive', title: 'Product not found' });
          router.push('/dashboard/products');
        }
        setIsLoading(false);
      };
      fetchProduct();
    }
  }, [id, reset, router, toast]);

  const handleGenerate = async (targetProduct: Product | null = product) => {
    if (!targetProduct || !targetProduct.imageUrl || !targetProduct.descriptionInput) {
        toast({variant: 'destructive', title: 'Cannot generate content', description: 'Image or description missing.'})
        return;
    }
    setIsGenerating(true);
    try {
        const result = await generateProductListing({
            photoDataUri: targetProduct.imageUrl,
            descriptionInput: targetProduct.descriptionInput,
        });

        setValue('aiTitle', result.aiTitle);
        setValue('aiStory', result.aiStory);
        setValue('aiPrice', result.aiPrice);
        setValue('aiTags', result.aiTags.map(t => ({ value: t })));

        toast({ title: 'AI Content Generated!', description: 'Review and edit the suggestions below.' });
    } catch (error) {
        console.error("AI Generation failed:", error);
        toast({ variant: 'destructive', title: 'AI Generation Failed' });
    } finally {
        setIsGenerating(false);
    }
  }


  const onSubmit = async (data: ProductFormValues, status: 'draft' | 'published') => {
    if (!id || !user) return;
    setIsSaving(true);
    try {
      const productRef = doc(db, 'products', id);
      const updatedData = {
        aiTitle: data.aiTitle,
        aiStory: data.aiStory,
        aiPrice: data.aiPrice,
        aiTags: data.aiTags.map(t => t.value),
        status: status,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(productRef, updatedData);
      
      toast({ title: `Product ${status === 'published' ? 'Published!' : 'Saved!'}` });

      if (status === 'published') {
          router.push('/dashboard/products');
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast({ variant: 'destructive', title: 'Save Failed' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      const productRef = doc(db, 'products', id);
      await deleteDoc(productRef);
      toast({ title: 'Product Deleted' });
      router.push('/dashboard/products');
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({ variant: 'destructive', title: 'Delete Failed' });
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8" /></div>;
  }

  if (!product) {
    return <div>Product not found.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold">Review Product</h1>
            <p className="text-muted-foreground">Review, edit and publish your product listing.</p>
        </div>
        <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="rounded-xl">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your product
                    and remove its data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              variant="outline"
              onClick={handleSubmit(data => onSubmit(data, 'draft'))}
              disabled={isSaving}
              className="rounded-xl"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Draft
            </Button>
            <Button
              onClick={handleSubmit(data => onSubmit(data, 'published'))}
              disabled={isSaving}
              className="rounded-xl soft-shadow"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Publish
            </Button>
        </div>
      </div>
      
      {product.status === 'draft' && !product.aiStory && !isGenerating && (
          <Alert>
              <AlertTitle>Ready for AI magic?</AlertTitle>
              <AlertDescription>Your product draft is saved. Click "Regenerate with AI" to create your product story, price, and tags.</AlertDescription>
          </Alert>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
            <Card className="rounded-2xl soft-shadow">
                <CardHeader>
                    <CardTitle>Product Media</CardTitle>
                </CardHeader>
                <CardContent>
                    <Image src={product.imageUrl} alt="Product image" width={400} height={400} className="w-full rounded-lg object-cover aspect-square"/>
                </CardContent>
            </Card>
            <Card className="rounded-2xl soft-shadow">
                <CardHeader>
                    <CardTitle>Original Description</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{product.descriptionInput}</p>
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-2">
          <form className="space-y-6">
            <Card className="rounded-2xl soft-shadow">
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle>AI-Generated Content</CardTitle>
                  <CardDescription>Edit the suggested content below or regenerate.</CardDescription>
                </div>
                <Button type="button" variant="secondary" onClick={() => handleGenerate()} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Regenerate
                </Button>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="aiTitle">Product Title</Label>
                  <Input id="aiTitle" {...register('aiTitle')} className="rounded-lg" />
                  {errors.aiTitle && <p className="text-sm text-destructive">{errors.aiTitle.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiStory">Product Story</Label>
                  <Textarea id="aiStory" {...register('aiStory')} rows={8} className="rounded-lg" />
                  {errors.aiStory && <p className="text-sm text-destructive">{errors.aiStory.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiPrice">Suggested Price (₹)</Label>
                  <Input id="aiPrice" type="number" {...register('aiPrice')} className="rounded-lg" />
                  {errors.aiPrice && <p className="text-sm text-destructive">{errors.aiPrice.message}</p>}
                </div>
                
                <div className="space-y-2">
                    <Label>Suggested Tags</Label>
                    <div className="space-y-2">
                        {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 items-center">
                            <Input {...register(`aiTags.${index}.value`)} className="rounded-lg" />
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="text-destructive h-4 w-4" />
                            </Button>
                        </div>
                        ))}
                         {errors.aiTags && <p className="text-sm text-destructive">{errors.aiTags.message}</p>}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })} className="mt-2 rounded-lg">
                        <PlusCircle className="mr-2 h-4 w-4"/> Add Tag
                    </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
