import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Expense } from "../types";
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, serverTimestamp, query, orderBy,
} from "firebase/firestore";
import { db } from "../lib/firebase";

let unsubExpenses: (() => void) | null = null;

interface ExpenseStore {
  expenses: Expense[];
  budget: Record<string, number>;
  addExpense: (expense: Omit<Expense, "id" | "createdAt">, familyId: string) => Promise<void>;
  updateExpense: (id: string, data: Partial<Expense>, familyId: string) => Promise<void>;
  deleteExpense: (id: string, familyId: string) => Promise<void>;
  setBudget: (category: string, amount: number) => void;
  subscribeToFamily: (familyId: string) => () => void;
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

      subscribeToFamily: (familyId: string) => {
        if (unsubExpenses) unsubExpenses();
        const col = collection(db, "families", familyId, "expenses");
        const q = query(col, orderBy("createdAt", "desc"));
        unsubExpenses = onSnapshot(q, (snap) => {
          const expenses: Expense[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Expense));
          set({ expenses });
        });
        return () => { if (unsubExpenses) unsubExpenses(); };
      },

      addExpense: async (expense, familyId) => {
        const col = collection(db, "families", familyId, "expenses");
        await addDoc(col, { ...expense, createdAt: serverTimestamp() });
      },

      updateExpense: async (id, data, familyId) => {
        const ref = doc(db, "families", familyId, "expenses", id);
        await updateDoc(ref, data);
      },

      deleteExpense: async (id, familyId) => {
        const ref = doc(db, "families", familyId, "expenses", id);
        await deleteDoc(ref);
      },

      setBudget: (category, amount) => {
        set((state) => ({ budget: { ...state.budget, [category]: amount } }));
      },

      getExpensesByMonth: (year, month) => {
        return get().expenses.filter((e) => {
          const d = new Date(e.date);
          return d.getFullYear() === year && d.getMonth() === month;
        });
      },

      getTotalByRole: (year, month) => {
        const expenses = get().getExpensesByMonth(year, month);
        return {
          husband: expenses.filter((e) => e.addedBy === "husband").reduce((s, e) => s + e.amount, 0),
          wife: expenses.filter((e) => e.addedBy === "wife").reduce((s, e) => s + e.amount, 0),
        };
      },

      getCategoryTotal: (category, year, month) => {
        return get().getExpensesByMonth(year, month)
          .filter((e) => e.category === category)
          .reduce((s, e) => s + e.amount, 0);
      },
    }),
    { name: "expense-store", storage: createJSONStorage(() => AsyncStorage) }
  )
);
