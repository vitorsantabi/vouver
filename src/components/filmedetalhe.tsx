import { useCallback, useEffect, useState } from "react";
import ListaPicker from "./ListaPicker";
import {
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useAvaliacao } from "../context/AvaliacoesContext";
import { type Filme } from "../types/filme";
import { Cores, Radius, Surface, Border, TextColor, Touch } from "../utils/cores";

const SHEET_HEIGHT = Dimensions.get("window").height * 0.78;
const IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

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
      <View style={styles.estrelasRow} accessibilityRole="adjustable">
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              setNotaSelecionada(i);
              onChange(i);
            }}
            hitSlop={Touch.hitSlop}
            accessibilityRole="button"
            accessibilityLabel={`${i} estrela${i > 1 ? "s" : ""}`}
            accessibilityState={{ selected: i <= notaSelecionada }}
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
  const translateY = useSharedValue(SHEET_HEIGHT);
  const backdropOp = useSharedValue(0);
  const [listaPickerAberto, setListaPickerAberto] = useState(false);

  const handleAvaliar = useCallback(
    (notaUser: number) => {
      if (filme) avaliar(filme, notaUser);
    },
    [filme, avaliar]
  );

  useEffect(() => {
    if (filme) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 120 });
      backdropOp.value = withTiming(1, { duration: 250 });
    }
  }, [filme]);

  const fechar = useCallback(() => {
    translateY.value = withTiming(SHEET_HEIGHT, { duration: 280 });
    backdropOp.value = withTiming(0, { duration: 250 }, () => {
      runOnJS(onFechar)();
    });
  }, [onFechar, translateY, backdropOp]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOp.value,
  }));

  if (!filme) return null;

  const ano = filme.release_date?.slice(0, 4) ?? "—";
  const nota = filme.vote_average ?? 0;
  const corNota = nota >= 7.5 ? "#4ade80" : nota >= 5 ? Cores.secundaria : "#f87171";

  return (
    <Modal transparent visible={!!filme} animationType="none" statusBarTranslucent>
      <TouchableWithoutFeedback onPress={fechar}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, sheetStyle]}>
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
                <Text style={styles.semPosterIcon}>🎬</Text>
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
              onChange={handleAvaliar}
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

          {/* Botão adicionar a lista */}
          <TouchableOpacity
            style={styles.btnLista}
            onPress={() => setListaPickerAberto(true)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Adicionar filme a uma lista"
          >
            <Text style={styles.btnListaTxt}>📋 Adicionar a uma lista</Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity
          style={styles.botaoFechar}
          onPress={fechar}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Fechar detalhes do filme"
        >
          <Text style={styles.botaoFecharTxt}>Fechar</Text>
        </TouchableOpacity>
      </Animated.View>

      <ListaPicker
        filme={filme}
        visible={listaPickerAberto}
        onFechar={() => setListaPickerAberto(false)}
      />
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
    backgroundColor: Surface.sheet,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderTopWidth: 1,
    borderColor: Border.light,
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
    borderRadius: Radius.md,
    backgroundColor: Cores.primaria + "15",
  },
  semPoster: { justifyContent: "center", alignItems: "center" },
  semPosterIcon: { fontSize: 40 },
  topoInfo: { flex: 1, gap: 8, paddingTop: 4 },
  titulo: {
    color: TextColor.primary,
    fontSize: 17,
    fontFamily: "Poppins_700Bold",
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
    backgroundColor: Cores.fundo,
    marginTop: 4,
  },
  notaNumero: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    lineHeight: 20,
  },
  notaLabel: {
    fontSize: 9,
    fontFamily: "Poppins_400Regular",
  },

  // Estrelas
  estrelasContainer: {
    backgroundColor: Cores.primaria + "10",
    borderRadius: Radius.md,
    padding: 16,
    gap: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Border.subtle,
  },
  estrelasLabel: {
    color: TextColor.primary,
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
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
    fontFamily: "Poppins_700Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  overview: {
    color: TextColor.muted,
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
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: "center",
    minHeight: Touch.minHeight,
    justifyContent: "center",
  },
  botaoFecharTxt: {
    color: Cores.fundo,
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
  },
  btnLista: {
    backgroundColor: Cores.primaria + "15",
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Border.subtle,
  },
  btnListaTxt: {
    color: Cores.primaria,
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
  },
});
