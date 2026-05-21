import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { Platform } from "react-native";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const requiredKeys = ["apiKey", "authDomain", "projectId", "appId"] as const;
const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key]);
const firebaseReady = missingKeys.length === 0;

if (!firebaseReady) {
  const msg =
    `[Firebase] Variáveis ausentes: ${missingKeys.join(", ")}. ` +
    "Copie .env.example para .env e preencha EXPO_PUBLIC_FIREBASE_*.";
  if (__DEV__) {
    console.error(msg);
  } else {
    console.warn(msg);
  }
}

function isWeb(): boolean {
  return Platform.OS === "web";
}

function createAuth(app: FirebaseApp): Auth {
  if (isWeb()) {
    try {
      return getAuth(app);
    } catch {
      // SSR / primeira carga na web
      return initializeAuth(app);
    }
  }

  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch (e: unknown) {
    const code =
      e && typeof e === "object" && "code" in e
        ? String((e as { code: string }).code)
        : "";
    // auth/already-initialized — hot reload ou segunda importação
    if (code === "auth/already-initialized") {
      return getAuth(app);
    }
    throw e;
  }
}

let app: FirebaseApp | undefined;
let auth: Auth;
let db: Firestore;

if (firebaseReady) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = createAuth(app);
  db = getFirestore(app);
} else {
  // Permite o bundle/SSR sem .env; login e Firestore falham até configurar as variáveis
  app = undefined;
  auth = undefined as unknown as Auth;
  db = undefined as unknown as Firestore;
}

export { auth, db, firebaseReady };
export default app;
