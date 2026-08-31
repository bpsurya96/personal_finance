import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth, GOOGLE_WEB_CLIENT_ID } from "./firebase";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

// ─── Configure Google Sign-In ─────────────────────────────────────────────────
// Reads webClientId directly from google-services.json via firebase.ts
export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
  });
}

// ─── Sign In with Google ──────────────────────────────────────────────────────
export async function signInWithGoogle(): Promise<User> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const signInResult = await GoogleSignin.signIn();

  // idToken lives at result.data.idToken in newer @react-native-google-signin SDK
  const idToken =
    (signInResult as any).data?.idToken ?? (signInResult as any).idToken;
  if (!idToken) throw new Error("No ID token received from Google");

  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  return result.user;
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  await GoogleSignin.signOut();
  await firebaseSignOut(auth);
}

// ─── Listen for Auth State Changes ────────────────────────────────────────────
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ─── Get current user ─────────────────────────────────────────────────────────
export function getCurrentUser(): User | null {
  return auth.currentUser;
}
