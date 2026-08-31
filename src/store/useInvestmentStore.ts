import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Investment, InvestmentType } from "../types";
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, serverTimestamp, query, orderBy,
} from "firebase/firestore";
import { db } from "../lib/firebase";

let unsubInvestments: (() => void) | null = null;

const EQUITY_TYPES: InvestmentType[] = ["mutual_fund", "stock", "us_etf", "non_us_etf"];
const DEBT_TYPES: InvestmentType[] = ["fd", "rd", "ppf", "epfo", "bond"];

interface InvestmentStore {
  investments: Investment[];
  addInvestment: (investment: Omit<Investment, "id" | "createdAt" | "updatedAt">, familyId: string) => Promise<void>;
  updateInvestment: (id: string, data: Partial<Investment>, familyId: string) => Promise<void>;
  deleteInvestment: (id: string, familyId: string) => Promise<void>;
  subscribeToFamily: (familyId: string) => () => void;
  getByType: (type: InvestmentType) => Investment[];
  getTotalInvested: () => number;
  getTotalCurrentValue: () => number;
  getAssetAllocation: () => { equity: number; debt: number; alternative: number };
}

export const useInvestmentStore = create<InvestmentStore>()(
  persist(
    (set, get) => ({
      investments: [],

      subscribeToFamily: (familyId: string) => {
        if (unsubInvestments) unsubInvestments();
        const col = collection(db, "families", familyId, "investments");
        const q = query(col, orderBy("createdAt", "desc"));
        unsubInvestments = onSnapshot(q, (snap) => {
          const investments: Investment[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Investment));
          set({ investments });
        });
        return () => { if (unsubInvestments) unsubInvestments(); };
      },

      addInvestment: async (investment, familyId) => {
        const col = collection(db, "families", familyId, "investments");
        await addDoc(col, { ...investment, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      },

      updateInvestment: async (id, data, familyId) => {
        const ref = doc(db, "families", familyId, "investments", id);
        await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
      },

      deleteInvestment: async (id, familyId) => {
        const ref = doc(db, "families", familyId, "investments", id);
        await deleteDoc(ref);
      },

      getByType: (type) => get().investments.filter((inv) => inv.type === type),
      getTotalInvested: () => get().investments.reduce((s, inv) => s + inv.investedAmount, 0),
      getTotalCurrentValue: () => get().investments.reduce((s, inv) => s + inv.currentValue, 0),
      getAssetAllocation: () => {
        const invs = get().investments;
        const total = invs.reduce((s, inv) => s + inv.currentValue, 0);
        if (total === 0) return { equity: 0, debt: 0, alternative: 0 };
        const equity = invs.filter((i) => EQUITY_TYPES.includes(i.type)).reduce((s, i) => s + i.currentValue, 0);
        const debt = invs.filter((i) => DEBT_TYPES.includes(i.type)).reduce((s, i) => s + i.currentValue, 0);
        return {
          equity: (equity / total) * 100,
          debt: (debt / total) * 100,
          alternative: ((total - equity - debt) / total) * 100,
        };
      },
    }),
    { name: "investment-store", storage: createJSONStorage(() => AsyncStorage) }
  )
);
