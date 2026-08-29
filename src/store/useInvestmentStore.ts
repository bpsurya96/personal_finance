import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Investment, InvestmentType } from '../types';

interface InvestmentStore {
  investments: Investment[];
  addInvestment: (investment: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInvestment: (id: string, data: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;
  getByType: (type: InvestmentType) => Investment[];
  getTotalInvested: () => number;
  getTotalCurrentValue: () => number;
  getAssetAllocation: () => { equity: number; debt: number; alternative: number };
}

const EQUITY_TYPES: InvestmentType[] = ['mutual_fund', 'stock', 'us_etf', 'non_us_etf'];
const DEBT_TYPES: InvestmentType[] = ['fd', 'rd', 'ppf', 'epfo', 'bond'];

export const useInvestmentStore = create<InvestmentStore>()(
  persist(
    (set, get) => ({
      investments: [],
      addInvestment: (investment) => {
        const now = new Date().toISOString();
        const newInvestment: Investment = {
          ...investment,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: now,
          updatedAt: now,
        };
        set(state => ({ investments: [...state.investments, newInvestment] }));
      },
      updateInvestment: (id, data) => {
        set(state => ({
          investments: state.investments.map(inv =>
            inv.id === id ? { ...inv, ...data, updatedAt: new Date().toISOString() } : inv
          ),
        }));
      },
      deleteInvestment: (id) => {
        set(state => ({ investments: state.investments.filter(inv => inv.id !== id) }));
      },
      getByType: (type) => get().investments.filter(inv => inv.type === type),
      getTotalInvested: () => get().investments.reduce((s, inv) => s + inv.investedAmount, 0),
      getTotalCurrentValue: () => get().investments.reduce((s, inv) => s + inv.currentValue, 0),
      getAssetAllocation: () => {
        const invs = get().investments;
        const total = invs.reduce((s, inv) => s + inv.currentValue, 0);
        if (total === 0) return { equity: 0, debt: 0, alternative: 0 };
        const equity = invs.filter(i => EQUITY_TYPES.includes(i.type)).reduce((s, i) => s + i.currentValue, 0);
        const debt = invs.filter(i => DEBT_TYPES.includes(i.type)).reduce((s, i) => s + i.currentValue, 0);
        const alternative = total - equity - debt;
        return {
          equity: (equity / total) * 100,
          debt: (debt / total) * 100,
          alternative: (alternative / total) * 100,
        };
      },
    }),
    { name: 'investment-store', storage: createJSONStorage(() => AsyncStorage) }
  )
);
