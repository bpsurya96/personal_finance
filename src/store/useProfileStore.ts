import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Profile {
  familyName: string;
  husband: { name: string; emoji: string };
  wife: { name: string; emoji: string };
  usdToInr: number;
  currency: string;
  onboardingComplete: boolean;
}

interface ProfileStore extends Profile {
  updateProfile: (updates: Partial<Profile>) => void;
  setOnboardingComplete: () => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      familyName: 'My Family',
      husband: { name: 'Husband', emoji: '👨' },
      wife: { name: 'Wife', emoji: '👩' },
      usdToInr: 84,
      currency: 'INR',
      onboardingComplete: false,
      updateProfile: (updates) => set(state => ({ ...state, ...updates })),
      setOnboardingComplete: () => set({ onboardingComplete: true }),
    }),
    { name: 'profile-store', storage: createJSONStorage(() => AsyncStorage) }
  )
);
