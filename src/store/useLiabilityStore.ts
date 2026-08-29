import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Liability {
  id: string;
  name: string;
  totalAmount: number;
  paidAmount: number;
  interestRate: number;
  termMonths: number;
}

interface LiabilityStore {
  liabilities: Liability[];
  addLiability: (liability: Omit<Liability, 'id'>) => void;
  removeLiability: (id: string) => void;
  updateLiability: (id: string, updates: Partial<Liability>) => void;
}

export const useLiabilityStore = create<LiabilityStore>()(
  persist(
    (set) => ({
      liabilities: [],
      addLiability: (liability) => set((state) => ({
        liabilities: [...state.liabilities, { ...liability, id: Math.random().toString(36).substring(7) }]
      })),
      removeLiability: (id) => set((state) => ({
        liabilities: state.liabilities.filter((l) => l.id !== id)
      })),
      updateLiability: (id, updates) => set((state) => ({
        liabilities: state.liabilities.map((l) => l.id === id ? { ...l, ...updates } : l)
      }))
    }),
    { name: 'liability-store', storage: createJSONStorage(() => AsyncStorage) }
  )
);
