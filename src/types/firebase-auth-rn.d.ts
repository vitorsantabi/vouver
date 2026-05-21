/**
 * Firebase 12 expõe getReactNativePersistence no bundle RN, mas os tipos do
 * entry "firebase/auth" apontam para o bundle browser. Metro resolve via metro.config.js.
 */
import type { Persistence } from "@firebase/auth";

declare module "firebase/auth" {
  export function getReactNativePersistence(
    storage: {
      getItem(key: string): Promise<string | null>;
      setItem(key: string, value: string): Promise<void>;
      removeItem(key: string): Promise<void>;
    }
  ): Persistence;
}
