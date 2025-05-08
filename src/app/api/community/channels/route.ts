import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const channels = await prisma.channel.findMany({
      select: { id: true, name: true, description: true, parentId: true }
    });
    return NextResponse.json({ channels });
  } catch (error) {
    console.error('Error fetching channels:', error);
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
  }
} 