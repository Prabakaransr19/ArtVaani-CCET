
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Story } from "@/lib/types";

export default function MyStoriesPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      if (user) {
        try {
          const storiesCol = collection(db, `stories`);
          // Note: In a real app, you'd query where('artisanId', '==', user.uid)
          // For now, we fetch all stories created by the user from the `users` subcollection
          // which is not ideal based on new schema. Let's adjust this later if needed.
          const userStoriesCol = collection(db, `users/${user.uid}/stories`);
          const storySnapshot = await getDocs(userStoriesCol);
          const storiesList = storySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Story));
          setStories(storiesList);
        } catch (error) {
          console.error("Error fetching stories:", error);
        }
      }
      setLoading(false);
    };

    fetchStories();
  }, [user]);


  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Stories</h1>
        <Link href="/dashboard/stories/new">
          <Button className="rounded-xl soft-shadow">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Story
          </Button>
        </Link>
      </div>

      {loading ? (
        <p>Loading your stories...</p>
      ) : stories.length > 0 ? (
        <div className="space-y-6">
          {stories.map(story => (
              <Card key={story.id} className="rounded-2xl soft-shadow">
                  <CardHeader>
                      <CardTitle>{story.title}</CardTitle>
                      <CardDescription>{story.finalStory.substring(0, 150) + '...'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="rounded-lg">Edit</Button>
                          <Button variant="destructive" size="sm" className="rounded-lg">Delete</Button>
                      </div>
                  </CardContent>
              </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">You haven't added any stories yet.</p>
      )}
    </div>
  );
}
