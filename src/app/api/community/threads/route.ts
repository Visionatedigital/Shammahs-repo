import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized - Please sign in to create a thread' }, { status: 401 });
    }

    const { name, isPrivate, initialMessage, forumId } = await req.json();

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Thread name is required' }, { status: 400 });
    }

    if (!initialMessage?.trim()) {
      return NextResponse.json({ error: 'Initial message is required' }, { status: 400 });
    }

    if (!forumId) {
      return NextResponse.json({ error: 'Forum ID is required' }, { status: 400 });
    }

    // Validate forum exists and check permissions
    const forum = await prisma.communityCategory.findUnique({
      where: { id: forumId }
    });

    if (!forum) {
      return NextResponse.json({ error: 'Invalid forum selected' }, { status: 400 });
    }

    // Check if the forum is admin-only and user is not an admin
    if (forum.isAdminOnly && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'You do not have permission to create threads in this forum' },
        { status: 403 }
      );
    }

    // Create the thread and its first message
    const thread = await prisma.communityThread.create({
      data: {
        name: name.trim(),
        forum: {
          connect: { id: forumId }
        },
        author: {
          connect: { id: session.user.id }
        },
        messages: {
          create: {
            content: initialMessage.trim(),
            author: {
              connect: { id: session.user.id }
            }
          }
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        messages: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ thread }, { status: 201 });
  } catch (error) {
    console.error('Error creating thread:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create thread. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const forumId = searchParams.get('forumId');

    if (!forumId) {
      return NextResponse.json({ error: 'Forum ID is required' }, { status: 400 });
    }

    const threads = await prisma.communityThread.findMany({
      where: {
        forumId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        messages: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ threads });
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
} 