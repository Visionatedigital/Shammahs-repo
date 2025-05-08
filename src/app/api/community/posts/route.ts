import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Announcement, CommunityPost } from '@prisma/client';

interface AnnouncementWithAuthor extends Announcement {
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface CommunityPostWithRelations extends CommunityPost {
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  category: {
    id: string;
    name: string;
    description: string;
    icon: string;
  };
  replies: {
    id: string;
    content: string;
    author: {
      id: string;
      name: string | null;
      image: string | null;
    };
    createdAt: Date;
  }[];
}

interface PostResponse {
  id: string;
  title: string;
  content: string;
  type: string;
  tags: string[];
  isPinned: boolean;
  viewsCount: number;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  replies: {
    id: string;
    content: string;
    author: {
      id: string;
      name: string | null;
      image: string | null;
    };
    createdAt: Date;
  }[];
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    if (category === 'announcements') {
      // For announcements, we'll use the Announcement model
      const announcements = await prisma.announcement.findMany({
        where: {
          isPublished: true,
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
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
      });

      // Transform announcements to match the expected format
      const posts: PostResponse[] = announcements.map((announcement: AnnouncementWithAuthor) => ({
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        tags: announcement.tags,
        isPinned: announcement.isPinned,
        viewsCount: announcement.views,
        createdAt: announcement.createdAt,
        author: announcement.author,
        replies: [], // Announcements don't have replies yet
      }));

      return NextResponse.json({ posts });
    }

    // For other categories, use the CommunityPost model
    const posts = await prisma.communityPost.findMany({
      where: {
        categoryId: category,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: true,
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized - Please sign in to create a post' }, { status: 401 });
    }

    const { title, content, category, tags } = await request.json();

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }

    // Validate category exists and check admin permissions
    const categoryExists = await prisma.communityCategory.findUnique({
      where: {
        id: category
      }
    });

    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Invalid category selected' },
        { status: 400 }
      );
    }

    // Check if the category is admin-only and user is not an admin
    if (categoryExists.isAdminOnly && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'You do not have permission to post in this category' },
        { status: 403 }
      );
    }

    // Create the post
    const post = await prisma.communityPost.create({
      data: {
        title,
        content,
        tags: tags || [],
        authorId: session.user.id,
        categoryId: categoryExists.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        category: true,
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error creating post:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create post. Please try again.' },
      { status: 500 }
    );
  }
} 