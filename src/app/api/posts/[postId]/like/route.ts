import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = params;
    const userId = session.user.id;

    // Check if user has already liked the post
    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (existingLike) {
      // Unlike the post
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      // Update post likes count
      await prisma.post.update({
        where: { id: postId },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
      });

      return NextResponse.json({ liked: false });
    }

    // Like the post
    await prisma.like.create({
      data: {
        postId,
        userId,
      },
    });

    // Update post likes count
    await prisma.post.update({
      where: { id: postId },
      data: {
        likesCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ liked: true });
  } catch (error) {
    console.error('Error handling like:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 