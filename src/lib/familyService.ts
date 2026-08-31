import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { User } from "firebase/auth";

export const userDoc = (uid: string) => doc(db, "users", uid);
export const familyDoc = (familyId: string) => doc(db, "families", familyId);
export const familyDataCol = (familyId: string, colName: string) =>
  collection(db, "families", familyId, colName);
export const inviteCol = () => collection(db, "invites");

export interface UserRecord {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  familyId: string;
  role: "owner" | "member";
  createdAt: any;
}

export interface FamilyRecord {
  id: string;
  familyName: string;
  ownerUid: string;
  members: string[];
  createdAt: any;
}

export interface FamilyInvite {
  id: string;
  fromUid: string;
  fromName: string;
  familyId: string;
  familyName: string;
  toEmail: string;
  status: "pending" | "accepted" | "declined";
  createdAt: any;
}

export async function getOrCreateUser(firebaseUser: User): Promise<UserRecord> {
  const ref = userDoc(firebaseUser.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as UserRecord;

  const familyId = firebaseUser.uid;
  const firstName = firebaseUser.displayName?.split(" ")[0] ?? "My";

  const userRecord: UserRecord = {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? "",
    displayName: firebaseUser.displayName ?? "User",
    photoURL: firebaseUser.photoURL ?? "",
    familyId,
    role: "owner",
    createdAt: serverTimestamp(),
  };

  const familyRecord: FamilyRecord = {
    id: familyId,
    familyName: firstName + "'s Family",
    ownerUid: firebaseUser.uid,
    members: [firebaseUser.uid],
    createdAt: serverTimestamp(),
  };

  await setDoc(ref, userRecord);
  await setDoc(familyDoc(familyId), familyRecord);
  return userRecord;
}

export async function inviteFamilyMember(
  fromUser: UserRecord,
  toEmail: string
): Promise<{ success: boolean; error?: string }> {
  const q = query(
    inviteCol(),
    where("familyId", "==", fromUser.familyId),
    where("toEmail", "==", toEmail.toLowerCase().trim()),
    where("status", "==", "pending")
  );
  const existing = await getDocs(q);
  if (!existing.empty) return { success: false, error: "Invite already sent." };

  const inviteRef = doc(inviteCol());
  await setDoc(inviteRef, {
    id: inviteRef.id,
    fromUid: fromUser.uid,
    fromName: fromUser.displayName,
    familyId: fromUser.familyId,
    familyName: "Family",
    toEmail: toEmail.toLowerCase().trim(),
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return { success: true };
}

export async function getPendingInvites(email: string): Promise<FamilyInvite[]> {
  const q = query(
    inviteCol(),
    where("toEmail", "==", email.toLowerCase().trim()),
    where("status", "==", "pending")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as FamilyInvite);
}

export async function acceptInvite(invite: FamilyInvite, newUser: UserRecord): Promise<void> {
  await updateDoc(userDoc(newUser.uid), { familyId: invite.familyId, role: "member" });
  const fam = await getDoc(familyDoc(invite.familyId));
  if (fam.exists()) {
    const members: string[] = fam.data().members ?? [];
    if (!members.includes(newUser.uid)) {
      await updateDoc(familyDoc(invite.familyId), { members: [...members, newUser.uid] });
    }
  }
  await updateDoc(doc(inviteCol(), invite.id), { status: "accepted" });
}

export async function declineInvite(inviteId: string): Promise<void> {
  await updateDoc(doc(inviteCol(), inviteId), { status: "declined" });
}

export async function getFamilyMembers(familyId: string): Promise<UserRecord[]> {
  const fam = await getDoc(familyDoc(familyId));
  if (!fam.exists()) return [];
  const memberUids: string[] = fam.data().members ?? [];
  const members = await Promise.all(memberUids.map((uid) => getDoc(userDoc(uid))));
  return members.filter((s) => s.exists()).map((s) => s.data() as UserRecord);
}

// ─── Remove family member ─────────────────────────────────────────────────────
export async function removeFamilyMember(familyId: string, memberUid: string): Promise<void> {
  const famRef = familyDoc(familyId);
  const famSnap = await getDoc(famRef);
  if (famSnap.exists()) {
    const members: string[] = famSnap.data().members ?? [];
    const newMembers = members.filter(uid => uid !== memberUid);
    await updateDoc(famRef, { members: newMembers });
  }

  // Detach member and recreate a solo family for them
  const uRef = userDoc(memberUid);
  await updateDoc(uRef, { familyId: memberUid, role: "owner" });
  
  const memberSnap = await getDoc(uRef);
  if (memberSnap.exists()) {
    const mData = memberSnap.data() as UserRecord;
    const newFamRef = familyDoc(memberUid);
    await setDoc(newFamRef, {
      id: memberUid,
      familyName: (mData.displayName?.split(' ')[0] ?? 'My') + "'s Family",
      ownerUid: memberUid,
      members: [memberUid],
      createdAt: serverTimestamp(),
    });
  }
}
