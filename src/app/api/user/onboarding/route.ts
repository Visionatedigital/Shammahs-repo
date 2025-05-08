import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { hasCompletedOnboarding } = body;

    // Update user onboarding status
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        hasCompletedOnboarding,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 