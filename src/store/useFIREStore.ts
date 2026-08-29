import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREConfig, FIREResult } from '../types';
import { calculateFIRE } from '../utils/calculations';

interface FIREStore {
  config: FIREConfig;
  result: FIREResult | null;
  updateConfig: (updates: Partial<FIREConfig>) => void;
  calculate: (currentCorpus?: number) => void;
}

const defaultConfig: FIREConfig = {
  currentAge: 30,
  retirementAge: 50,
  currentMonthlyExpenses: 50000,
  inflationRate: 6,
  expectedReturn: 12,
  currentCorpus: 0,
  monthlySIP: 20000,
};

export const useFIREStore = create<FIREStore>()(
  persist(
    (set, get) => ({
      config: defaultConfig,
      result: null,
      updateConfig: (updates) => {
        set(state => ({ config: { ...state.config, ...updates } }));
      },
      calculate: (currentCorpus) => {
        const config = {
          ...get().config,
          ...(currentCorpus !== undefined ? { currentCorpus } : {}),
        };
        const result = calculateFIRE(config);
        set({ result, config });
      },
    }),
    { name: 'fire-store', storage: createJSONStorage(() => AsyncStorage) }
  )
);
