import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useAvaliacao } from "../context/AvaliacoesContext";
import { type Filme } from "../types/filme";
import { Cores } from "../utils/cores";

const SHEET_HEIGHT = Dimensions.get("window").height * 0.78;
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

type Props = {
  filme: Filme | null;
  onFechar: () => void;
};

function SeletorEstrelas({
  filmeId,
  onChange,
}: {
  filmeId: number;
  onChange: (nota: number) => void;
}) {
  const { avaliados } = useAvaliacao();
  const jaAvaliado = avaliados.find((f) => f.id === filmeId);
  const [notaSelecionada, setNotaSelecionada] = useState(jaAvaliado?.minhaNotaId ?? 0);

  useEffect(() => {
    const atual = avaliados.find((f) => f.id === filmeId);
    setNotaSelecionada(atual?.minhaNotaId ?? 0);
  }, [filmeId, avaliados]);

  return (
    <View style={styles.estrelasContainer}>
      <Text style={styles.estrelasLabel}>
        {notaSelecionada > 0 ? `Sua nota: ${notaSelecionada}/5` : "Avaliar filme"}
      </Text>
      <View style={styles.estrelasRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              setNotaSelecionada(i);
              onChange(i);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Text style={[styles.estrela, i <= notaSelecionada && styles.estrelaAtiva]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function FilmeDetalhe({ filme, onFechar }: Props) {
  const { avaliar } = useAvaliacao();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: filme ? 0 : SHEET_HEIGHT,
        useNativeDriver: true,
        damping: 20,
        stiffness: 120,
      }),
      Animated.timing(backdropOpacity, {
        toValue: filme ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [filme]);

  const fechar = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: SHEET_HEIGHT, duration: 280, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => onFechar());
  };

  if (!filme) return null;

  const ano = filme.release_date?.slice(0, 4) ?? "—";
  const nota = filme.vote_average ?? 0;
  const corNota = nota >= 7.5 ? "#4ade80" : nota >= 5 ? Cores.secundaria : "#f87171";

  return (
    <Modal transparent visible={!!filme} animationType="none" statusBarTranslucent>
      <TouchableWithoutFeedback onPress={fechar}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View style={styles.handle} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Topo: poster + info */}
          <View style={styles.topo}>
            {filme.poster_path ? (
              <Image
                source={{ uri: `${IMAGE_BASE}${filme.poster_path}` }}
                style={styles.poster}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.poster, styles.semPoster]}>
                <Text style={{ fontSize: 40 }}>🎬</Text>
              </View>
            )}

            <View style={styles.topoInfo}>
              <Text style={styles.titulo}>{filme.title}</Text>
              <Text style={styles.ano}>📅 {ano}</Text>

              {/* Nota TMDB */}
              <View style={[styles.notaCirculo, { borderColor: corNota }]}>
                <Text style={[styles.notaNumero, { color: corNota }]}>{nota.toFixed(1)}</Text>
                <Text style={[styles.notaLabel, { color: corNota + "aa" }]}>TMDB</Text>
              </View>
            </View>
          </View>

          {/* Avaliação do usuário */}
          <View style={styles.secao}>
            <SeletorEstrelas
              filmeId={filme.id}
              onChange={(notaUser) => avaliar(filme, notaUser)}
            />
          </View>

          {/* Sinopse */}
          {filme.overview ? (
            <View style={styles.secao}>
              <Text style={styles.secaoTitulo}>Sinopse</Text>
              <Text style={styles.overview}>{filme.overview}</Text>
            </View>
          ) : (
            <Text style={styles.semSinopse}>Sinopse não disponível em português.</Text>
          )}
        </ScrollView>

        <TouchableOpacity style={styles.botaoFechar} onPress={fechar}>
          <Text style={styles.botaoFecharTxt}>Fechar</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000cc",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: Cores.primaria + "30",
    paddingBottom: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Cores.primaria + "44",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  scroll: { padding: 20, gap: 20 },

  // Topo
  topo: { flexDirection: "row", gap: 16, alignItems: "flex-start" },
  poster: {
    width: 110,
    height: 165,
    borderRadius: 14,
    backgroundColor: Cores.primaria + "15",
  },
  semPoster: { justifyContent: "center", alignItems: "center" },
  topoInfo: { flex: 1, gap: 8, paddingTop: 4 },
  titulo: {
    color: "#f1f5f9",
    fontSize: 17,
    fontFamily: "Poppins_400Regular",
    fontWeight: "700",
    lineHeight: 24,
  },
  ano: {
    color: Cores.primaria + "99",
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
  },
  notaCirculo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B132B",
    marginTop: 4,
  },
  notaNumero: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    fontWeight: "700",
    lineHeight: 20,
  },
  notaLabel: {
    fontSize: 9,
    fontFamily: "Poppins_400Regular",
  },

  // Estrelas
  estrelasContainer: {
    backgroundColor: Cores.primaria + "10",
    borderRadius: 14,
    padding: 16,
    gap: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Cores.primaria + "20",
  },
  estrelasLabel: {
    color: "#f1f5f9",
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    fontWeight: "700",
  },
  estrelasRow: { flexDirection: "row", gap: 8 },
  estrela: {
    fontSize: 32,
    color: Cores.primaria + "22",
  },
  estrelaAtiva: { color: Cores.secundaria },

  // Seção
  secao: { gap: 10 },
  secaoTitulo: {
    color: Cores.primaria,
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  overview: {
    color: "#cbd5e1",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    lineHeight: 22,
  },
  semSinopse: {
    color: Cores.primaria + "55",
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    textAlign: "center",
  },

  // Botão fechar
  botaoFechar: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: Cores.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  botaoFecharTxt: {
    color: Cores.fundo,
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    fontWeight: "700",
  },
});
