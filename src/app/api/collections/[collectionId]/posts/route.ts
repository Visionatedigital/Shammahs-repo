import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { collectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Verify collection belongs to user
    const collection = await prisma.collection.findFirst({
      where: {
        id: params.collectionId,
        userId: session.user.id,
      },
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Add post to collection
    const collectionPost = await prisma.collectionPost.create({
      data: {
        collectionId: params.collectionId,
        postId,
      },
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
    });

    // Transform the response
    const transformedPost = {
      id: collectionPost.post.id,
      imageUrl: collectionPost.post.imageUrl,
      caption: collectionPost.post.caption,
      createdAt: collectionPost.post.createdAt,
      user: collectionPost.post.user,
      likes: collectionPost.post.likes.length,
      isLiked: collectionPost.post.likes.some(like => like.userId === session.user.id),
    };

    return NextResponse.json({ post: transformedPost });
  } catch (error) {
    console.error('Error adding post to collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { collectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Verify collection belongs to user
    const collection = await prisma.collection.findFirst({
      where: {
        id: params.collectionId,
        userId: session.user.id,
      },
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Remove post from collection
    await prisma.collectionPost.deleteMany({
      where: {
        collectionId: params.collectionId,
        postId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing post from collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 