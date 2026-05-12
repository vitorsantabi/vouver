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
import { auth } from "../lib/firebase";
import { Cores } from "../utils/cores";

// Regex de validação de e-mail
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Remove caracteres que podem ser usados em injection/XSS
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

  // Guard contra cliques múltiplos antes do estado atualizar
  const emProgresso = useRef(false);

  const handleCadastro = useCallback(async () => {
    if (emProgresso.current) return;

    // Validações locais
    if (!nome.trim() || !email || !senha) {
      setErro("Preencha todos os campos.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setErro("Digite um e-mail válido.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    emProgresso.current = true;
    setErro("");
    setCarregando(true);

    try {
      const nomeSanitizado = sanitizarTexto(nome);
      const emailNormalizado = email.trim().toLowerCase();

      const cred = await createUserWithEmailAndPassword(
        auth,
        emailNormalizado,
        senha,
      );
      await updateProfile(cred.user, { displayName: nomeSanitizado });
      router.replace("/(tabs)");
    } catch (e: any) {
      if (__DEV__) console.warn("[Auth] Cadastro error:", e.code);
      const msg: Record<string, string> = {
        "auth/email-already-in-use": "Este e-mail já está em uso.",
        "auth/invalid-email": "E-mail inválido.",
        "auth/weak-password": "Senha fraca. Use pelo menos 6 caracteres.",
        "auth/network-request-failed":
          "Sem conexão com a internet. Verifique sua rede.",
        "auth/too-many-requests":
          "Muitas tentativas. Tente novamente mais tarde.",
      };
      setErro(msg[e.code] ?? "Erro ao cadastrar. Tente novamente.");
    } finally {
      setCarregando(false);
      emProgresso.current = false;
    }
  }, [nome, email, senha, router]);

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
          {/* Logo + voltar */}
          <View style={styles.viewLogo}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.botaoVoltar}
            >
              <Text style={styles.textVoltar}>← Voltar</Text>
            </TouchableOpacity>
            <Text style={styles.textLogo}>Cadastro</Text>
          </View>

          {/* Card */}
          <View style={styles.viewCard}>
            <CampoInput
              label="Nome"
              placeholder="Digite o seu nome"
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={60}
              value={nome}
              onChangeText={(v) => {
                setNome(v);
                setErro("");
              }}
            />
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
              placeholder="Digite a sua senha (mín. 6 caracteres)"
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
                style={styles.botaoCadastrar}
              />
            ) : (
              <Botao
                titulo="Cadastrar"
                onPress={handleCadastro}
                corFundo={Cores.secundaria}
                style={styles.botaoCadastrar}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Cores.fundo,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 32,
  },

  // Logo
  viewLogo: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  botaoVoltar: {
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  textVoltar: {
    fontFamily: "Poppins_400Regular",
    color: Cores.primaria,
    fontSize: 12,
  },
  textLogo: {
    fontSize: 48,
    fontFamily: "Poppins_400Regular",
    color: Cores.primaria,
    letterSpacing: 2,
    textShadowColor: "#6e6e6e",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },

  // Card
  viewCard: {
    backgroundColor: Cores.primaria,
    marginHorizontal: 20,
    borderRadius: 32,
    paddingVertical: 32,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  botaoCadastrar: {
    marginTop: 24,
  },
  textoErro: {
    fontFamily: "Poppins_400Regular",
    color: "#FF6B6B",
    fontSize: 10,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 16,
  },
});
