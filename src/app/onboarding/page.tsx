'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import OnboardingQuestionnaire from '@/components/OnboardingQuestionnaire';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Only redirect to dashboard if user is authenticated and has completed onboarding
    if (session?.user?.hasCompletedOnboarding === true) {
      router.push('/dashboard');
    }
  }, [session, router]);

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  // Show onboarding questionnaire for both authenticated and unauthenticated users
  return <OnboardingQuestionnaire />;
}