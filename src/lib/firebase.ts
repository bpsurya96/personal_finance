import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Read config directly from google-services.json (no .env needed!)
// @ts-ignore — JSON imports work fine in Metro bundler
import googleServices from "../../google-services.json";

const client = googleServices.client[0];
const projectInfo = googleServices.project_info;

// Web client ID: oauth_client with client_type === 3 (web)
const webOauthClient = (client.oauth_client as any[]).find((c) => c.client_type === 3);
export const GOOGLE_WEB_CLIENT_ID: string = webOauthClient?.client_id ?? "";

const firebaseConfig = {
  apiKey: client.api_key[0].current_key,
  authDomain: projectInfo.project_id + ".firebaseapp.com",
  projectId: projectInfo.project_id,
  storageBucket: projectInfo.storage_bucket,
  messagingSenderId: projectInfo.project_number,
  appId: client.client_info.mobilesdk_app_id,
};

// Prevent duplicate initializations during hot-reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export default app;
