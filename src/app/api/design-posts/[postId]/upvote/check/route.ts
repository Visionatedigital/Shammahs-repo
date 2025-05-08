import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if the post exists
    const post = await prisma.designPost.findUnique({
      where: { id: params.postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if the user has upvoted the post
    const upvote = await prisma.designUpvote.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: params.postId,
        },
      },
    });

    return NextResponse.json({
      hasUpvoted: !!upvote,
      upvotes: post.upvotes,
    });
  } catch (error) {
    console.error('Error checking upvote status:', error);
    return NextResponse.json(
      { error: 'Failed to check upvote status' },
      { status: 500 }
    );
  }
} 