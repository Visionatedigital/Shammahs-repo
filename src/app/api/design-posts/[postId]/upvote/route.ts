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

    // Check if the user has already upvoted the post
    const existingUpvote = await prisma.designUpvote.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: params.postId,
        },
      },
    });

    if (existingUpvote) {
      // Remove the upvote
      await prisma.designUpvote.delete({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: params.postId,
          },
        },
      });

      // Update the post's upvote count
      const updatedPost = await prisma.designPost.update({
        where: { id: params.postId },
        data: {
          upvotes: {
            decrement: 1,
          },
        },
      });

      return NextResponse.json({
        upvoted: false,
        upvotes: updatedPost.upvotes,
      });
    } else {
      // Add the upvote
      await prisma.designUpvote.create({
        data: {
          userId: session.user.id,
          postId: params.postId,
        },
      });

      // Update the post's upvote count
      const updatedPost = await prisma.designPost.update({
        where: { id: params.postId },
        data: {
          upvotes: {
            increment: 1,
          },
        },
      });

      return NextResponse.json({
        upvoted: true,
        upvotes: updatedPost.upvotes,
      });
    }
  } catch (error) {
    console.error('Error handling upvote:', error);
    return NextResponse.json(
      { error: 'Failed to handle upvote' },
      { status: 500 }
    );
  }
} 