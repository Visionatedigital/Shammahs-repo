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

    const events = await prisma.event.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        attendees: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Transform the response to match the frontend interface
    const transformedEvents = events.map(event => ({
      ...event,
      host: event.user, // Rename user to host for frontend compatibility
    }));

    return NextResponse.json({ events: transformedEvents });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, startTime, endTime, location, maxAttendees } = body;

    // Validate required fields
    if (!title || !description || !startTime || !endTime || !location || !maxAttendees) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the event
    const event = await prisma.event.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location,
        maxAttendees: parseInt(maxAttendees),
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        attendees: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Transform the response to match the frontend interface
    const transformedEvent = {
      ...event,
      host: event.user, // Rename user to host for frontend compatibility
    };

    return NextResponse.json(transformedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 