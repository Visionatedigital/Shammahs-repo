import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const announcements = [
      {
        title: 'Welcome to StudioSix Community!',
        content: 'We\'re excited to launch our new community platform. Here you can share your work, get feedback, and connect with other architects and designers.',
        type: 'update',
        tags: ['welcome', 'community'],
        isPinned: true,
        authorId: session.user.id,
      },
      {
        title: 'Monthly Design Challenge: Sustainable Housing',
        content: 'Join our first monthly design challenge focused on sustainable housing solutions. Submit your designs by the end of the month for a chance to be featured!',
        type: 'event',
        tags: ['challenge', 'sustainability'],
        isPinned: true,
        authorId: session.user.id,
      },
      {
        title: 'New Feature: Real-time Collaboration',
        content: 'We\'ve just released real-time collaboration features. Now you can work on projects together with your team in real-time!',
        type: 'feature',
        tags: ['feature', 'collaboration'],
        isPinned: false,
        authorId: session.user.id,
      },
    ];

    for (const announcement of announcements) {
      await prisma.announcement.upsert({
        where: { title: announcement.title },
        update: {},
        create: {
          ...announcement,
          preview: announcement.content.substring(0, 150) + '...',
          isPublished: true,
          views: 0,
        },
      });
    }

    return NextResponse.json({ message: 'Announcements seeded successfully' });
  } catch (error) {
    console.error('Error seeding announcements:', error);
    return NextResponse.json(
      { error: 'Failed to seed announcements' },
      { status: 500 }
    );
  }
} 