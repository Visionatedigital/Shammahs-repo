import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST new reaction
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { messageId, emoji } = body;

    if (!messageId || !emoji) {
      return NextResponse.json({ error: 'Message ID and emoji are required' }, { status: 400 });
    }

    // Check if reaction already exists
    const existingReaction = await prisma.chatReaction.findFirst({
      where: {
        messageId,
        userId: session.user.id,
        emoji,
      },
    });

    if (existingReaction) {
      // Remove reaction if it already exists
      await prisma.chatReaction.delete({
        where: {
          id: existingReaction.id,
        },
      });
      return NextResponse.json({ removed: true });
    }

    // Create new reaction
    const reaction = await prisma.chatReaction.create({
      data: {
        messageId,
        userId: session.user.id,
        emoji,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(reaction);
  } catch (error) {
    console.error('Error handling reaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET reactions for a message
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const reactions = await prisma.chatReaction.findMany({
      where: {
        messageId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Group reactions by emoji
    const groupedReactions = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          users: [],
        };
      }
      acc[reaction.emoji].count++;
      acc[reaction.emoji].users.push(reaction.user);
      return acc;
    }, {} as Record<string, { emoji: string; count: number; users: any[] }>);

    return NextResponse.json(Object.values(groupedReactions));
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 