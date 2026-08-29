import { Redirect } from 'expo-router';
import { useProfileStore } from '../src/store/useProfileStore';

export default function Index() {
  const onboardingComplete = useProfileStore(s => s.onboardingComplete);
  if (!onboardingComplete) return <Redirect href="/auth/onboarding" />;
  return <Redirect href="/tabs" />;
}
