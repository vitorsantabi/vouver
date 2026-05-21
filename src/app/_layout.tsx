import "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { AvaliacoesProvider } from "../context/AvaliacoesContext";
import { ListasProvider } from "../context/ListasContext";
import { usePoppins } from "../utils/fonts";
import { Cores } from "../utils/cores";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsLoaded, fontError] = usePoppins();

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <AvaliacoesProvider>
      <ListasProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
            contentStyle: { backgroundColor: Cores.fundo },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="cadastro" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ListasProvider>
    </AvaliacoesProvider>
  );
}
