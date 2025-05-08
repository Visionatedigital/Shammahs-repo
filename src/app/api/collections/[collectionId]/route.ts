import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { collectionId: string } }
) {
  try {
    console.log('Starting collection fetch for ID:', params.collectionId);
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error('No session or user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching collection:', {
      collectionId: params.collectionId,
      userId: session.user.id
    });

    const collection = await prisma.collection.findUnique({
      where: {
        id: params.collectionId,
        userId: session.user.id,
      },
      include: {
        posts: {
          include: {
            post: {
              include: {
                user: {
                  select: {
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!collection) {
      console.error('Collection not found:', {
        collectionId: params.collectionId,
        userId: session.user.id
      });
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    console.log('Collection found:', {
      id: collection.id,
      name: collection.name,
      postCount: collection.posts.length
    });

    // Transform the posts to match the Post type
    const transformedPosts = collection.posts.map((collectionPost) => ({
      id: collectionPost.post.id,
      imageUrl: collectionPost.post.imageUrl,
      caption: collectionPost.post.caption || '',
      createdAt: collectionPost.post.createdAt.toISOString(),
      author: {
        name: collectionPost.post.user.name || 'Unknown',
        image: collectionPost.post.user.image || '/default-avatar.png',
      },
      likesCount: collectionPost.post.likesCount,
      commentsCount: collectionPost.post.commentsCount,
      sharesCount: collectionPost.post.sharesCount,
    }));

    return NextResponse.json({
      collection: {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        posts: transformedPosts,
      },
    });
  } catch (error) {
    console.error('Error in collection API:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
} 