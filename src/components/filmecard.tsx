import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";
import { type Filme } from "../types/filme";
import { Cores } from "../utils/cores";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

type Props = {
  filme: Filme;
  onPress?: (filme: Filme) => void;
  style?: ViewStyle;
};

export default function FilmeCard({ filme, onPress, style }: Props) {
  const ano = filme.release_date?.slice(0, 4) ?? "—";
  const nota = filme.vote_average ?? 0;
  const corNota =
    nota >= 7.5 ? "#4ade80" : nota >= 5 ? Cores.secundaria : "#f87171";

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={() => onPress?.(filme)}
      activeOpacity={0.8}
    >
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

      <View style={[styles.notaBadge, { borderColor: corNota + "66" }]}>
        <Text style={[styles.notaText, { color: corNota }]}>
          ★ {nota.toFixed(1)}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.titulo} numberOfLines={2}>
          {filme.title}
        </Text>
        <Text style={styles.ano}>{ano}</Text>
        <Text style={styles.overview} numberOfLines={3}>
          {filme.overview}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 170,
    height: "auto",
    marginRight: 5,
    borderRadius: 16,
    backgroundColor: "#111827",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Cores.primaria + "20",
  },
  poster: {
    width: "100%",
    height: 340,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Cores.primaria + "20",
  },
  semPoster: {
    backgroundColor: Cores.primaria + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  semPosterIcon: { fontSize: 40 },
  notaBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#0B132Bee",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  notaText: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    fontWeight: "700",
  },
  info: { padding: 10, gap: 4 },
  titulo: {
    color: "#f1f5f9",
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    lineHeight: 20,
  },
  ano: {
    color: Cores.primaria + "99",
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
  },
  overview: {
    color: "#94a3b8",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    lineHeight: 17,
  },
});
