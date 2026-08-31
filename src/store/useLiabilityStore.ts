import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Liability {
  id: string;
  name: string;
  totalAmount: number;
  paidAmount: number;
  interestRate: number;
  termMonths: number;
}

let unsubLiabilities: (() => void) | null = null;

interface LiabilityStore {
  liabilities: Liability[];
  addLiability: (liability: Omit<Liability, "id">, familyId: string) => Promise<void>;
  removeLiability: (id: string, familyId: string) => Promise<void>;
  updateLiability: (id: string, updates: Partial<Liability>, familyId: string) => Promise<void>;
  subscribeToFamily: (familyId: string) => () => void;
}

export const useLiabilityStore = create<LiabilityStore>()(
  persist(
    (set) => ({
      liabilities: [],

      subscribeToFamily: (familyId: string) => {
        if (unsubLiabilities) unsubLiabilities();
        const col = collection(db, "families", familyId, "liabilities");
        unsubLiabilities = onSnapshot(col, (snap) => {
          const liabilities: Liability[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Liability));
          set({ liabilities });
        });
        return () => { if (unsubLiabilities) unsubLiabilities(); };
      },

      addLiability: async (liability, familyId) => {
        const col = collection(db, "families", familyId, "liabilities");
        await addDoc(col, { ...liability, createdAt: serverTimestamp() });
      },

      removeLiability: async (id, familyId) => {
        const ref = doc(db, "families", familyId, "liabilities", id);
        await deleteDoc(ref);
      },

      updateLiability: async (id, updates, familyId) => {
        const ref = doc(db, "families", familyId, "liabilities", id);
        await updateDoc(ref, updates);
      },
    }),
    { name: "liability-store", storage: createJSONStorage(() => AsyncStorage) }
  )
);
