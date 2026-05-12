import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import {
  Alert,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAvaliacao } from "../../context/AvaliacoesContext";
import { auth } from "../../lib/firebase";
import { Cores } from "../../utils/cores";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w185";

function EstrelaNota({ nota }: { nota: number }) {
  return (
    <View style={styles.estrelasRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text
          key={i}
          style={[styles.estrela, i <= nota && styles.estrelaAtiva]}
        >
          ★
        </Text>
      ))}
    </View>
  );
}

export default function PerfilTab() {
  const router = useRouter();
  const { avaliados, remover } = useAvaliacao();
  const usuario = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/");
    } catch {
      Alert.alert("Erro", "Não foi possível sair. Tente novamente.");
    }
  };

  const primeiroNome =
    usuario?.displayName?.split(" ")[0] ?? usuario?.email?.split("@")[0] ?? "você";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Cores.fundo} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetra}>
              {primeiroNome[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>
          <View>
            <Text style={styles.nome}>{usuario?.displayName ?? primeiroNome}</Text>
            <Text style={styles.email}>{usuario?.email}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.botaoSair} onPress={handleLogout}>
          <Text style={styles.textSair}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumero}>{avaliados.length}</Text>
          <Text style={styles.statLabel}>Avaliados</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumero}>
            {avaliados.length > 0
              ? (avaliados.reduce((s, f) => s + f.minhaNotaId, 0) / avaliados.length).toFixed(1)
              : "—"}
          </Text>
          <Text style={styles.statLabel}>Nota média</Text>
        </View>
      </View>

      {/* Lista */}
      {avaliados.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioEmoji}>🎬</Text>
          <Text style={styles.vazioTitulo}>Nenhum filme avaliado</Text>
          <Text style={styles.vazioSub}>
            Toque em um filme e dê sua nota para ele aparecer aqui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...avaliados].reverse()}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.poster_path ? (
                <Image
                  source={{ uri: `${IMAGE_BASE}${item.poster_path}` }}
                  style={styles.poster}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.poster, styles.semPoster]}>
                  <Text style={{ fontSize: 28 }}>🎬</Text>
                </View>
              )}

              <View style={styles.cardInfo}>
                <Text style={styles.cardTitulo} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.cardAno}>
                  {item.release_date?.slice(0, 4) ?? "—"} · ⭐ {item.vote_average?.toFixed(1)}
                </Text>
                <EstrelaNota nota={item.minhaNotaId} />
                <Text style={styles.minhaNotaTxt}>
                  Sua nota: {item.minhaNotaId}/5
                </Text>
              </View>

              <TouchableOpacity
                style={styles.removerBtn}
                onPress={() =>
                  Alert.alert("Remover", "Remover avaliação?", [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Remover", style: "destructive", onPress: async () => await remover(item.id) },
                  ])
                }
              >
                <Text style={styles.removerTxt}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Cores.fundo },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Cores.primaria + "15",
  },
  avatarContainer: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Cores.primaria + "22",
    borderWidth: 2,
    borderColor: Cores.primaria,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetra: {
    fontSize: 20,
    fontFamily: "Poppins_400Regular",
    color: Cores.primaria,
    fontWeight: "700",
  },
  nome: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: "#f1f5f9",
    fontWeight: "700",
  },
  email: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Cores.primaria + "88",
  },
  botaoSair: {
    backgroundColor: Cores.accent,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 30,
  },
  textSair: {
    fontFamily: "Poppins_400Regular",
    color: Cores.fundo,
    fontSize: 12,
    fontWeight: "600",
  },

  // Stats
  stats: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    gap: 32,
    borderBottomWidth: 1,
    borderBottomColor: Cores.primaria + "15",
  },
  statItem: { alignItems: "center", gap: 2 },
  statNumero: {
    fontSize: 28,
    fontFamily: "Poppins_400Regular",
    color: Cores.primaria,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Cores.primaria + "88",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Cores.primaria + "20",
  },

  // Vazio
  vazio: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10, padding: 32 },
  vazioEmoji: { fontSize: 56 },
  vazioTitulo: {
    fontSize: 18,
    fontFamily: "Poppins_400Regular",
    color: "#f1f5f9",
    fontWeight: "700",
    textAlign: "center",
  },
  vazioSub: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Cores.primaria + "88",
    textAlign: "center",
    lineHeight: 20,
  },

  // Lista
  lista: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, gap: 12 },
  card: {
    flexDirection: "row",
    backgroundColor: "#111827",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Cores.primaria + "20",
    alignItems: "center",
  },
  poster: { width: 80, height: 110 },
  semPoster: {
    backgroundColor: Cores.primaria + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: { flex: 1, padding: 12, gap: 4 },
  cardTitulo: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#f1f5f9",
    fontWeight: "700",
    lineHeight: 19,
  },
  cardAno: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Cores.primaria + "99",
  },
  estrelasRow: { flexDirection: "row", gap: 2, marginTop: 4 },
  estrela: {
    fontSize: 16,
    color: Cores.primaria + "33",
  },
  estrelaAtiva: { color: Cores.secundaria },
  minhaNotaTxt: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Cores.primaria + "88",
  },
  removerBtn: {
    padding: 14,
    alignSelf: "flex-start",
  },
  removerTxt: {
    fontSize: 14,
    color: Cores.primaria + "44",
  },
});
