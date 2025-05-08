import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET messages with pagination
export async function GET(
  request: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    console.log('Fetching messages for channel:', params.channelId);
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Unauthorized: No session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    console.log('Query params:', { page, limit, skip });

    const messages = await prisma.chatMessage.findMany({
      where: {
        channelId: params.channelId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    console.log('Found messages:', messages.length);

    const total = await prisma.chatMessage.count({
      where: {
        channelId: params.channelId,
      },
    });

    console.log('Total messages:', total);

    const response = {
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        hasMore: skip + messages.length < total,
      },
    };

    console.log('Sending response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST new message
export async function POST(
  request: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    console.log('Creating message for channel:', params.channelId);
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Unauthorized: No session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, fileUrl, fileType } = body;

    console.log('Message content:', { content, fileUrl, fileType });

    if (!content) {
      console.log('Bad request: Content is required');
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        content,
        channelId: params.channelId,
        userId: session.user.id,
        fileUrl,
        fileType,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        reactions: true,
      },
    });

    console.log('Created message:', message);
    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 