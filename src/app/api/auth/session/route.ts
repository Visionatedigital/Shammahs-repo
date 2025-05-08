import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // If there's no session, return null (this is expected behavior)
    if (!session?.user?.email) {
      return NextResponse.json(null);
    }

    // If the URL includes the update parameter, fetch fresh user data
    const url = new URL(request.url);
    const shouldUpdate = url.searchParams.has('update');

    if (shouldUpdate) {
      // Fetch fresh user data from the database
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          bannerImage: true,
          credits: true,
          level: true,
          verified: true,
          subscriptionStatus: true,
          hasCompletedOnboarding: true
        }
      });

      if (!user) {
        return NextResponse.json(null);
      }

      // Return updated session data
      return NextResponse.json({
        ...session,
        user: {
          ...session.user,
          ...user
        }
      });
    }

    // Return current session data
    return NextResponse.json(session);
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 