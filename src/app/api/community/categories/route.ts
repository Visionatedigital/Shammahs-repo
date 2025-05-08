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

    const categories = await prisma.communityCategory.findMany({
      include: {
        _count: {
          select: {
            posts: true,
            threads: true,
          },
        },
        threads: {
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                messages: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      categories: categories.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        icon: category.icon,
        type: category.type,
        isAdminOnly: category.isAdminOnly,
        postCount: category._count.posts,
        forums: category.threads.map(thread => ({
          id: thread.id,
          name: thread.name,
          description: `${thread._count.messages} messages`,
          postCount: thread._count.messages,
        })),
      })),
    });
  } catch (error) {
    console.error('Error fetching community categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community categories' },
      { status: 500 }
    );
  }
} 