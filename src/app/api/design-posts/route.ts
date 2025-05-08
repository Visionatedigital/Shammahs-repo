import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const style = searchParams.get('style');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const where = style ? { style } : {};

    const [posts, total] = await Promise.all([
      prisma.designPost.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              comments: true,
              upvotes: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.designPost.count({ where }),
    ]);

    return NextResponse.json({
      posts: posts.map(post => ({
        ...post,
        commentsCount: post._count.comments,
        upvotesCount: post._count.upvotes,
        _count: undefined,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching design posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch design posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, prompt, images, videos, style, tags, externalLinks } = body;

    if (!title || !images?.length || !style) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const post = await prisma.designPost.create({
      data: {
        title,
        description,
        prompt,
        images,
        videos: videos || [],
        style,
        tags,
        externalLinks,
        authorId: session.user.id,
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

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating design post:', error);
    return NextResponse.json(
      { error: 'Failed to create design post' },
      { status: 500 }
    );
  }
} 