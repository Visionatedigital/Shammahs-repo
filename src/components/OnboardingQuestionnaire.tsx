'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface QuestionnaireData {
  role: string;
  useCase: string;
  preferredStyle: string;
  experienceLevel: string;
  wantsTips: boolean;
}

const roles = [
  { id: 'architect', label: 'Architect', icon: '🧱' },
  { id: 'interior-designer', label: 'Interior Designer', icon: '🪑' },
  { id: 'student', label: 'Student / Learner', icon: '✏️' },
  { id: 'concept-artist', label: 'Concept Artist', icon: '🖌️' },
  { id: 'product-designer', label: 'Product Designer', icon: '🛠️' },
  { id: 'other', label: 'Other', icon: '🧠' },
];

const useCases = [
  { id: 'client-presentations', label: 'For client presentations' },
  { id: 'assignments', label: 'For school/design assignments' },
  { id: 'inspiration', label: 'For inspiration & ideation' },
  { id: 'collaboration', label: 'For team collaboration' },
  { id: 'exploring', label: 'Just exploring' },
];

const styles = [
  { id: 'photorealistic', label: 'Photorealistic' },
  { id: 'conceptual', label: 'Conceptual' },
  { id: 'artistic', label: 'Artistic/Hand-drawn look' },
  { id: 'not-sure', label: 'Not sure yet' },
];

const experienceLevels = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'professional', label: 'Professional' },
];

export default function OnboardingQuestionnaire() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<QuestionnaireData>({
    role: '',
    useCase: '',
    preferredStyle: '',
    experienceLevel: '',
    wantsTips: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      if (!session?.user?.id) {
        throw new Error('Not authenticated');
      }

      // First, save the user preferences
      const preferencesResponse = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!preferencesResponse.ok) {
        const errorData = await preferencesResponse.json();
        throw new Error(errorData.error || 'Failed to save preferences');
      }

      // Then, update the onboarding status
      const onboardingResponse = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hasCompletedOnboarding: true }),
        credentials: 'include',
      });

      if (!onboardingResponse.ok) {
        const errorData = await onboardingResponse.json();
        throw new Error(errorData.error || 'Failed to update onboarding status');
      }

      // Force a session update to reflect the new onboarding status
      await fetch('/api/auth/session?update', {
        method: 'GET',
        credentials: 'include',
      });

      toast.success('Preferences saved successfully!');
      router.push('/pricing');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">What best describes you?</h2>
            <div className="grid grid-cols-2 gap-4">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setData({ ...data, role: role.id })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    data.role === role.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{role.icon}</div>
                  <div className="font-medium">{role.label}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">How do you use StudioSix?</h2>
            <div className="space-y-4">
              {useCases.map((useCase) => (
                <button
                  key={useCase.id}
                  onClick={() => setData({ ...data, useCase: useCase.id })}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    data.useCase === useCase.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {useCase.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">What are your preferred output styles?</h2>
            <div className="space-y-4">
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setData({ ...data, preferredStyle: style.id })}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    data.preferredStyle === style.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">What's your design experience level?</h2>
            <div className="space-y-4">
              {experienceLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setData({ ...data, experienceLevel: level.id })}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    data.experienceLevel === level.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">
              Would you like to receive style presets and tips tailored to your workflow?
            </h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setData({ ...data, wantsTips: true })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  data.wantsTips
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                ✅ Yes, help me optimize!
              </button>
              <button
                onClick={() => setData({ ...data, wantsTips: false })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  !data.wantsTips
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                ❌ No, I'll explore on my own
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  s <= step ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {renderStep()}

        <div className="mt-8 flex justify-between">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              Back
            </button>
          )}
          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Complete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 