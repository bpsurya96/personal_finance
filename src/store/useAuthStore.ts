import { create } from "zustand";
import { User } from "firebase/auth";
import { UserRecord } from "../lib/familyService";

interface AuthState {
  firebaseUser: User | null;
  userRecord: UserRecord | null;
  isLoading: boolean;
  isPro: boolean;
  setFirebaseUser: (user: User | null) => void;
  setUserRecord: (record: UserRecord | null) => void;
  setLoading: (v: boolean) => void;
  upgradeToPro: () => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  userRecord: null,
  isLoading: true,
  isPro: false,
  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
  setUserRecord: (userRecord) => set({ userRecord }),
  setLoading: (isLoading) => set({ isLoading }),
  upgradeToPro: () => set({ isPro: true }),
  clear: () => set({ firebaseUser: null, userRecord: null, isLoading: false, isPro: false }),
}));
