import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { useFonts } from "expo-font";

/** Apenas os pesos usados no app — carregar 18 variantes estoura RAM em APK release. */
export const FONTS = {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} as const;

export type PoppinsVariant = keyof typeof FONTS;

export function usePoppins() {
  return useFonts(FONTS);
}
