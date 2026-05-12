import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
import { auth } from "../lib/firebase";
import { signInWithGoogleCredential } from "../services/auth";
import { Cores } from "../utils/cores";

// ─── Validação de e-mail ─────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GOOGLE_ICON = require("../../assets/images/google-icon.png");

export default function Index() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [carregandoGoogle, setCarregandoGoogle] = useState(false);
  const emProgresso = useRef(false);

  // ─── Hook oficial do Google (gerencia redirect URI automaticamente) ──────────
  // webClientId  → "Web application" no Google Cloud Console
  // androidClientId → "Android" (opcional, para build nativo)
  // iosClientId     → "iOS" (opcional, para build nativo)
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  // ─── Reage à resposta do Google OAuth ───────────────────────────────────────
  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.authentication?.idToken;
      if (!idToken) {
        setErro("Não foi possível obter o token do Google.");
        setCarregandoGoogle(false);
        emProgresso.current = false;
        return;
      }

      signInWithGoogleCredential(idToken)
        .then(() => {
          if (__DEV__)
            console.log("[Google Auth] Login OK:", auth.currentUser?.email);
          router.replace("/(tabs)");
        })
        .catch((e: any) => {
          if (__DEV__) console.warn("[Google Auth] Erro Firebase:", e.code);
          const msg: Record<string, string> = {
            "auth/account-exists-with-different-credential":
              "Este e-mail já está vinculado a outro método de login.",
            "auth/network-request-failed": "Sem conexão. Verifique sua rede.",
          };
          setErro(msg[e.code] ?? "Erro ao entrar com Google. Tente novamente.");
        })
        .finally(() => {
          setCarregandoGoogle(false);
          emProgresso.current = false;
        });
    } else if (response?.type === "error") {
      setErro("Erro ao autenticar com Google. Tente novamente.");
      setCarregandoGoogle(false);
      emProgresso.current = false;
    } else if (response?.type === "dismiss" || response?.type === "cancel") {
      // Usuário fechou o browser — sem mensagem de erro
      setCarregandoGoogle(false);
      emProgresso.current = false;
    }
  }, [response]);

  // ─── Login e-mail / senha ────────────────────────────────────────────────────
  const handleLogin = useCallback(async () => {
    if (emProgresso.current) return;
    if (!email || !senha) {
      setErro("Preencha todos os campos.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setErro("Digite um e-mail válido.");
      return;
    }

    emProgresso.current = true;
    setErro("");
    setCarregando(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), senha);
      router.replace("/(tabs)");
    } catch (e: any) {
      if (__DEV__) console.warn("[Auth] Login error:", e.code);
      const msg: Record<string, string> = {
        "auth/invalid-credential": "E-mail ou senha incorretos.",
        "auth/user-not-found": "E-mail ou senha incorretos.",
        "auth/wrong-password": "E-mail ou senha incorretos.",
        "auth/invalid-email": "E-mail inválido.",
        "auth/too-many-requests":
          "Muitas tentativas. Aguarde e tente novamente.",
        "auth/network-request-failed": "Sem conexão. Verifique sua rede.",
      };
      setErro(msg[e.code] ?? "Erro ao entrar. Tente novamente.");
    } finally {
      setCarregando(false);
      emProgresso.current = false;
    }
  }, [email, senha, router]);

  // ─── Login com Google ────────────────────────────────────────────────────────
  const handleGoogleLogin = useCallback(async () => {
    if (emProgresso.current || !request) return;
    emProgresso.current = true;
    setErro("");
    setCarregandoGoogle(true);
    await promptAsync(); // resposta tratada no useEffect acima
  }, [request, promptAsync]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 40}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.viewLogo}>
            <Text style={styles.textLogo}>VouVer</Text>
            <Text style={styles.textSubLogo}>Seu guia de streaming</Text>
          </View>

          {/* Card de login */}
          <View style={styles.viewCard}>
            <CampoInput
              label="E-mail"
              placeholder="Digite o seu e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setErro("");
              }}
            />
            <CampoInput
              label="Senha"
              placeholder="Digite a sua senha"
              senhaToggle
              value={senha}
              onChangeText={(v) => {
                setSenha(v);
                setErro("");
              }}
            />

            {erro ? <Text style={styles.textoErro}>{erro}</Text> : null}

            {carregando ? (
              <ActivityIndicator
                color={Cores.fundo}
                style={styles.botaoEntrar}
              />
            ) : (
              <Botao
                titulo="Entrar"
                onPress={handleLogin}
                corFundo={Cores.secundaria}
                style={styles.botaoEntrar}
              />
            )}

            {/* Divisor */}
            <View style={styles.divisorRow}>
              <View style={styles.divisorLinha} />
              <Text style={styles.divisorTexto}>ou</Text>
              <View style={styles.divisorLinha} />
            </View>

            {/* Botão Google */}
            <TouchableOpacity
              style={[
                styles.botaoGoogle,
                (carregandoGoogle || !request) && styles.botaoGoogleDisabled,
              ]}
              onPress={handleGoogleLogin}
              disabled={carregandoGoogle || carregando || !request}
              activeOpacity={0.85}
              accessibilityLabel="Entrar com Google"
              accessibilityRole="button"
            >
              {carregandoGoogle ? (
                <ActivityIndicator size="small" color="#4285F4" />
              ) : (
                <>
                  <Image
                    source={GOOGLE_ICON}
                    style={styles.googleIcone}
                    resizeMode="contain"
                  />
                  <Text style={styles.botaoGoogleTexto}>Entrar com Google</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Cadastro */}
          <View style={styles.viewCadastro}>
            <Text style={styles.textCadastro}>Ainda não tem conta?</Text>
            <Botao
              titulo="Cadastre-se"
              onPress={() => router.push("/cadastro")}
              corFundo={Cores.accent}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Cores.fundo },
  keyboardView: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 32 },

  viewLogo: { alignItems: "center", width: "100%", paddingVertical: 32 },
  textLogo: {
    fontSize: 48,
    fontFamily: "Poppins_400Regular",
    color: Cores.primaria,
    letterSpacing: 2,
    textShadowColor: "#6e6e6e",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  textSubLogo: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Cores.primaria + "aa",
    letterSpacing: 2,
  },

  viewCard: {
    backgroundColor: Cores.primaria,
    marginHorizontal: 20,
    borderRadius: 32,
    paddingVertical: 32,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  botaoEntrar: { marginTop: 24 },
  textoErro: {
    fontFamily: "Poppins_400Regular",
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 16,
  },

  divisorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    width: "80%",
    gap: 8,
  },
  divisorLinha: { flex: 1, height: 1, backgroundColor: Cores.fundo + "44" },
  divisorTexto: {
    fontFamily: "Poppins_400Regular",
    color: Cores.fundo + "99",
    fontSize: 12,
  },

  botaoGoogle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    height: 50,
    width: "80%",
    marginTop: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  botaoGoogleDisabled: { opacity: 0.5 },
  googleIcone: { width: 20, height: 20 },
  botaoGoogleTexto: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3C3C3C",
    letterSpacing: 0.3,
  },

  viewCadastro: { alignItems: "center", marginTop: 28, gap: 8 },
  textCadastro: {
    fontFamily: "Poppins_400Regular",
    color: Cores.primaria + "cc",
    fontSize: 14,
  },
});
