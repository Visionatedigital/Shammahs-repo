import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const post = await prisma.designPost.findUnique({
      where: { id: params.postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            upvotes: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...post,
      upvotesCount: post._count.upvotes,
      _count: undefined,
    });
  } catch (error) {
    console.error('Error fetching design post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch design post' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const post = await prisma.designPost.findUnique({
      where: { id: params.postId },
      select: { authorId: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, prompt, images, videos, style, tags, externalLinks } = body;

    const updatedPost = await prisma.designPost.update({
      where: { id: params.postId },
      data: {
        title,
        description,
        prompt,
        images,
        videos,
        style,
        tags,
        externalLinks,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating design post:', error);
    return NextResponse.json(
      { error: 'Failed to update design post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const post = await prisma.designPost.findUnique({
      where: { id: params.postId },
      select: { authorId: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await prisma.designPost.delete({
      where: { id: params.postId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting design post:', error);
    return NextResponse.json(
      { error: 'Failed to delete design post' },
      { status: 500 }
    );
  }
} 