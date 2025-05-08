import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all collections for the current user
    const collections = await prisma.collection.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        posts: {
          select: {
            postId: true,
          },
        },
      },
    });

    // Transform the data to show which posts are in which collections
    const postCollections: { [postId: string]: string[] } = {};
    
    collections.forEach(collection => {
      collection.posts.forEach(collectionPost => {
        if (!postCollections[collectionPost.postId]) {
          postCollections[collectionPost.postId] = [];
        }
        postCollections[collectionPost.postId].push(collection.id);
      });
    });

    // Return empty object if no collections exist
    return NextResponse.json({ postCollections: postCollections || {} });
  } catch (error) {
    console.error('Error fetching post collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post collections' },
      { status: 500 }
    );
  }
} 