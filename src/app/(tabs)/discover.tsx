import { StatusBar, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Cores, TextColor, Spacing } from "../../utils/cores";

export default function DiscoverTab() {
  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={Cores.fundo} />
      <Animated.View entering={FadeInDown.duration(500)} style={s.content}>
        <Text style={s.emoji}>🔍</Text>
        <Text style={s.titulo}>Discover</Text>
        <Text style={s.sub}>Em breve: descubra filmes deslizando como TikTok!</Text>
        <Text style={s.hint}>⬅️ Não curtir · ➡️ Quero ver · ⬆️ Detalhes</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Cores.fundo },
  content: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12, padding: Spacing.xxxl },
  emoji: { fontSize: 64 },
  titulo: { fontSize: 24, fontFamily: "Poppins_700Bold", color: TextColor.primary },
  sub: { fontSize: 14, fontFamily: "Poppins_400Regular", color: Cores.primaria + "88", textAlign: "center", lineHeight: 22 },
  hint: { fontSize: 12, fontFamily: "Poppins_400Regular", color: Cores.primaria + "55", textAlign: "center", marginTop: 8 },
});
