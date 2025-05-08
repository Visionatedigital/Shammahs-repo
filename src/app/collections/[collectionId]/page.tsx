'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Post } from '@/types';
import { PostCard } from '@/components/PostCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'react-hot-toast';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  posts: Post[];
}

export default function CollectionPage({ params }: { params: { collectionId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in');
      return;
    }

    const fetchCollection = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!params?.collectionId) {
          throw new Error('Collection ID is required');
        }

        console.log('Fetching collection with ID:', params.collectionId);
        const response = await fetch(`/api/collections/${params.collectionId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch collection');
        }
        
        const data = await response.json();
        console.log('Collection data received:', data);
        
        if (!data.collection) {
          throw new Error('No collection data received');
        }
        
        setCollection(data.collection);
      } catch (error) {
        console.error('Error in fetchCollection:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load collection';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && params?.collectionId) {
      fetchCollection();
    }
  }, [status, router, params?.collectionId]);

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout currentPage="Collections">
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout currentPage="Collections">
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push('/library')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Library
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!collection) {
    return (
      <DashboardLayout currentPage="Collections">
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-gray-500 mb-4">Collection not found</p>
          <button
            onClick={() => router.push('/library')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Library
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="Collections">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{collection.name}</h1>
          {collection.description && (
            <p className="text-gray-600">{collection.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collection.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {collection.posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No posts in this collection yet</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 