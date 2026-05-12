import { useRouter } from "expo-router";
import { User } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FilmesLista from "../../components/filmeslista";
import { auth } from "../../lib/firebase";
import { Cores } from "../../utils/cores";

export default function HomeTab() {
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);
  const [usuario, setUsuario] = useState<User | null>(null);

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      if (!user) router.replace("/");
      else { setUsuario(user); setVerificando(false); }
    });
  }, []);

  if (verificando) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Cores.primaria} />
      </SafeAreaView>
    );
  }

  const primeiroNome =
    usuario?.displayName?.split(" ")[0] ?? usuario?.email?.split("@")[0] ?? "você";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Cores.fundo} />
      <View style={styles.header}>
        <Text style={styles.logo}>VouVer 🎬</Text>
        <Text style={styles.saudacao}>Olá, {primeiroNome}!</Text>
      </View>
      <FilmesLista />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Cores.fundo },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Cores.primaria + "15",
  },
  logo: {
    fontSize: 20,
    fontFamily: "Poppins_400Regular",
    color: Cores.primaria,
    fontWeight: "700",
  },
  saudacao: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Cores.primaria + "88",
    marginTop: 1,
  },
});
