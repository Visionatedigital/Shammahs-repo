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

    const collections = await prisma.collection.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        posts: {
          include: {
            post: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
                likes: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Transform collections to include post details
    const transformedCollections = collections.map(collection => ({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      posts: collection.posts.map(collectionPost => ({
        id: collectionPost.post.id,
        imageUrl: collectionPost.post.imageUrl,
        caption: collectionPost.post.caption,
        createdAt: collectionPost.post.createdAt,
        user: collectionPost.post.user,
        likes: collectionPost.post.likes.length,
        isLiked: collectionPost.post.likes.some(like => like.userId === session.user.id),
      })),
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    }));

    return NextResponse.json({ collections: transformedCollections });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const collection = await prisma.collection.create({
      data: {
        name,
        description,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ collection });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 