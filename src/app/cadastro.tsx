import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Botao from "../components/buttom";
import CampoInput from "../components/input";
import { auth, firebaseReady } from "../lib/firebase";
import { Cores, Spacing, Radius, State, Touch } from "../utils/cores";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizarTexto(valor: string): string {
  return valor.trim().replace(/[<>'"\\]/g, "");
}

export default function CadastroScreen() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const emProgresso = useRef(false);

  const handleCadastro = useCallback(async () => {
    if (emProgresso.current) return;
    if (!firebaseReady) {
      setErro("Firebase não configurado. Copie .env.example para .env.");
      return;
    }
    if (!nome.trim() || !email || !senha) { setErro("Preencha todos os campos."); return; }
    if (!EMAIL_REGEX.test(email)) { setErro("Digite um e-mail válido."); return; }
    if (senha.length < 6) { setErro("A senha deve ter pelo menos 6 caracteres."); return; }

    emProgresso.current = true;
    setErro("");
    setCarregando(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), senha);
      await updateProfile(cred.user, { displayName: sanitizarTexto(nome) });
      router.replace("/(tabs)");
    } catch (e: any) {
      if (__DEV__) console.warn("[Auth] Cadastro error:", e.code);
      const msg: Record<string, string> = {
        "auth/email-already-in-use": "Este e-mail já está em uso.",
        "auth/invalid-email": "E-mail inválido.",
        "auth/weak-password": "Senha fraca. Use pelo menos 6 caracteres.",
        "auth/network-request-failed": "Sem conexão. Verifique sua rede.",
        "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
      };
      setErro(msg[e.code] ?? "Erro ao cadastrar. Tente novamente.");
    } finally { setCarregando(false); emProgresso.current = false; }
  }, [nome, email, senha, router]);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={s.kv} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 40}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={s.viewLogo}>
            <TouchableOpacity onPress={() => router.back()} style={s.botaoVoltar} hitSlop={Touch.hitSlop} accessibilityRole="button" accessibilityLabel="Voltar">
              <Text style={s.textVoltar}>← Voltar</Text>
            </TouchableOpacity>
            <Text style={s.textLogo}>Cadastro</Text>
          </View>
          <View style={s.viewCard}>
            <CampoInput label="Nome" placeholder="Digite o seu nome" autoCapitalize="words" autoCorrect={false} maxLength={60} value={nome} onChangeText={(v) => { setNome(v); setErro(""); }} />
            <CampoInput label="E-mail" placeholder="Digite o seu e-mail" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={(v) => { setEmail(v); setErro(""); }} />
            <CampoInput label="Senha" placeholder="Mínimo 6 caracteres" senhaToggle value={senha} onChangeText={(v) => { setSenha(v); setErro(""); }} />
            {erro ? (<View style={s.erroBox}><Text style={s.erroIcon}>⚠</Text><Text style={s.erroTxt}>{erro}</Text></View>) : null}
            {carregando ? (<ActivityIndicator color={Cores.fundo} style={s.btn} />) : (<Botao titulo="Cadastrar" onPress={handleCadastro} corFundo={Cores.secundaria} style={s.btn} />)}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Cores.fundo },
  kv: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: Spacing.xxxl },
  viewLogo: { width: "100%", alignItems: "center", paddingVertical: Spacing.xxxl, paddingHorizontal: Spacing.xl },
  botaoVoltar: { alignSelf: "flex-start", marginBottom: Spacing.md, paddingVertical: 6, paddingHorizontal: 4, minHeight: 36, justifyContent: "center" },
  textVoltar: { fontFamily: "Poppins_500Medium", color: Cores.primaria, fontSize: 13 },
  textLogo: { fontSize: 48, fontFamily: "Poppins_400Regular", color: Cores.primaria, letterSpacing: 2, textShadowColor: "#6e6e6e", textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4 },
  viewCard: { backgroundColor: Cores.primaria, marginHorizontal: Spacing.xl, borderRadius: Radius.xl + 4, paddingVertical: Spacing.xxxl, paddingHorizontal: Spacing.xl, alignItems: "center" },
  btn: { marginTop: Spacing.xxl },
  erroBox: { flexDirection: "row", alignItems: "center", backgroundColor: State.errorBg, borderRadius: Radius.sm, paddingHorizontal: 12, paddingVertical: 8, marginTop: Spacing.sm, width: "85%", gap: 6 },
  erroIcon: { fontSize: 14 },
  erroTxt: { fontFamily: "Poppins_400Regular", color: State.error, fontSize: 12, flex: 1 },
});
