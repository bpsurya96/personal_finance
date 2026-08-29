import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from '../types';

interface ExpenseStore {
  expenses: Expense[];
  budget: Record<string, number>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  setBudget: (category: string, amount: number) => void;
  getExpensesByMonth: (year: number, month: number) => Expense[];
  getTotalByRole: (year: number, month: number) => { husband: number; wife: number };
  getCategoryTotal: (category: string, year: number, month: number) => number;
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      expenses: [],
      budget: {
        food: 10000, transport: 5000, shopping: 8000, health: 3000,
        entertainment: 3000, utilities: 5000, emi_rent: 20000,
        education: 2000, travel: 5000, gifts: 2000, others: 3000,
      },
      addExpense: (expense) => {
        const newExpense: Expense = {
          ...expense,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
        };
        set(state => ({ expenses: [newExpense, ...state.expenses] }));
      },
      updateExpense: (id, data) => {
        set(state => ({
          expenses: state.expenses.map(e => e.id === id ? { ...e, ...data } : e),
        }));
      },
      deleteExpense: (id) => {
        set(state => ({ expenses: state.expenses.filter(e => e.id !== id) }));
      },
      setBudget: (category, amount) => {
        set(state => ({ budget: { ...state.budget, [category]: amount } }));
      },
      getExpensesByMonth: (year, month) => {
        return get().expenses.filter(e => {
          const d = new Date(e.date);
          return d.getFullYear() === year && d.getMonth() === month;
        });
      },
      getTotalByRole: (year, month) => {
        const expenses = get().getExpensesByMonth(year, month);
        return {
          husband: expenses.filter(e => e.addedBy === 'husband').reduce((s, e) => s + e.amount, 0),
          wife: expenses.filter(e => e.addedBy === 'wife').reduce((s, e) => s + e.amount, 0),
        };
      },
      getCategoryTotal: (category, year, month) => {
        return get().getExpensesByMonth(year, month)
          .filter(e => e.category === category)
          .reduce((s, e) => s + e.amount, 0);
      },
    }),
    { name: 'expense-store', storage: createJSONStorage(() => AsyncStorage) }
  )
);
