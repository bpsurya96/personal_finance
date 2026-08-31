import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, serverTimestamp, query, orderBy
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Income {
  id: string;
  type: "salary" | "passive";
  name: string;
  amount: number;
  frequency: "monthly" | "yearly" | "one-time";
  createdAt?: any;
}

let unsubIncomes: (() => void) | null = null;

interface IncomeStore {
  incomes: Income[];
  addIncome: (income: Omit<Income, "id" | "createdAt">, familyId: string) => Promise<void>;
  updateIncome: (id: string, data: Partial<Income>, familyId: string) => Promise<void>;
  deleteIncome: (id: string, familyId: string) => Promise<void>;
  subscribeToFamily: (familyId: string) => () => void;
  getTotalYearlySalary: () => number;
  getTotalYearlyPassive: () => number;
}

export const useIncomeStore = create<IncomeStore>()(
  persist(
    (set, get) => ({
      incomes: [],

      subscribeToFamily: (familyId: string) => {
        if (unsubIncomes) unsubIncomes();
        const col = collection(db, "families", familyId, "incomes");
        const q = query(col, orderBy("createdAt", "desc"));
        unsubIncomes = onSnapshot(q, (snap) => {
          const incomes: Income[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Income));
          set({ incomes });
        });
        return () => { if (unsubIncomes) unsubIncomes(); };
      },

      addIncome: async (income, familyId) => {
        const col = collection(db, "families", familyId, "incomes");
        await addDoc(col, { ...income, createdAt: serverTimestamp() });
      },

      updateIncome: async (id, data, familyId) => {
        const ref = doc(db, "families", familyId, "incomes", id);
        await updateDoc(ref, data);
      },

      deleteIncome: async (id, familyId) => {
        const ref = doc(db, "families", familyId, "incomes", id);
        await deleteDoc(ref);
      },

      getTotalYearlySalary: () => {
        return get().incomes
          .filter(i => i.type === "salary")
          .reduce((sum, inc) => {
            if (inc.frequency === "monthly") return sum + (inc.amount * 12);
            if (inc.frequency === "yearly") return sum + inc.amount;
            return sum;
          }, 0);
      },

      getTotalYearlyPassive: () => {
        return get().incomes
          .filter(i => i.type === "passive")
          .reduce((sum, inc) => {
            if (inc.frequency === "monthly") return sum + (inc.amount * 12);
            if (inc.frequency === "yearly") return sum + inc.amount;
            return sum; // ignore one-time in yearly recurring totals
          }, 0);
      }
    }),
    { name: "income-store", storage: createJSONStorage(() => AsyncStorage) }
  )
);
