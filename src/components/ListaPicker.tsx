import React, { useCallback } from "react";
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useListas } from "../context/ListasContext";
import { type Filme } from "../types/filme";
import { Cores, Radius, Surface, Border, TextColor, Spacing, Touch } from "../utils/cores";

const SHEET_H = Dimensions.get("window").height * 0.45;

type Props = {
  filme: Filme | null;
  visible: boolean;
  onFechar: () => void;
};

export default function ListaPicker({ filme, visible, onFechar }: Props) {
  const { listas, addFilme, removeFilme, filmeNaLista } = useListas();
  const translateY = useSharedValue(SHEET_H);
  const backdropOp = useSharedValue(0);

  React.useEffect(() => {
    if (visible && filme) {
      translateY.value = withSpring(0, { damping: 22, stiffness: 130 });
      backdropOp.value = withTiming(1, { duration: 250 });
    }
  }, [visible, filme]);

  const fechar = useCallback(() => {
    translateY.value = withTiming(SHEET_H, { duration: 280 });
    backdropOp.value = withTiming(0, { duration: 250 }, () => runOnJS(onFechar)());
  }, [onFechar, translateY, backdropOp]);

  const handleToggle = useCallback(
    async (listaId: string) => {
      if (!filme) return;
      if (filmeNaLista(listaId, filme.id)) {
        await removeFilme(listaId, filme.id);
      } else {
        await addFilme(listaId, filme);
      }
    },
    [filme, filmeNaLista, addFilme, removeFilme]
  );

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOp.value }));

  if (!visible || !filme) return null;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <TouchableWithoutFeedback onPress={fechar}>
        <Animated.View style={[s.backdrop, backdropStyle]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[s.sheet, sheetStyle]}>
        <View style={s.handle} />
        <Text style={s.titulo}>Adicionar a uma lista</Text>
        <Text style={s.subtitulo} numberOfLines={1}>{filme.title}</Text>

        <View style={s.listaContainer}>
          {listas.map((lista, idx) => {
            const estaNaLista = filmeNaLista(lista.id, filme.id);
            return (
              <Animated.View key={lista.id} entering={FadeInDown.delay(idx * 60).duration(300)}>
                <TouchableOpacity
                  style={[s.listaRow, estaNaLista && s.listaRowAtiva]}
                  onPress={() => handleToggle(lista.id)}
                  activeOpacity={0.85}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: estaNaLista }}
                  accessibilityLabel={`${lista.nome}${estaNaLista ? ", adicionado" : ""}`}
                >
                  <Text style={s.listaIcone}>{lista.icone}</Text>
                  <Text style={[s.listaNome, estaNaLista && s.listaNomeAtiva]}>{lista.nome}</Text>
                  <Text style={s.listaCheck}>{estaNaLista ? "✓" : ""}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "#000000cc" },
  sheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    height: SHEET_H,
    backgroundColor: Surface.sheet,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    borderTopWidth: 1, borderColor: Border.light,
    padding: 20,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Cores.primaria + "44", alignSelf: "center", marginBottom: 16 },
  titulo: { fontSize: 16, fontFamily: "Poppins_700Bold", color: TextColor.primary, textAlign: "center" },
  subtitulo: { fontSize: 13, fontFamily: "Poppins_400Regular", color: Cores.primaria + "88", textAlign: "center", marginTop: 4, marginBottom: 16 },
  listaContainer: { gap: 8 },
  listaRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Surface.card, borderRadius: Radius.md,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: Border.subtle,
    minHeight: Touch.minHeight,
  },
  listaRowAtiva: { borderColor: Cores.primaria, backgroundColor: Cores.primaria + "15" },
  listaIcone: { fontSize: 20 },
  listaNome: { flex: 1, fontSize: 15, fontFamily: "Poppins_600SemiBold", color: TextColor.primary },
  listaNomeAtiva: { color: Cores.primaria },
  listaCheck: { fontSize: 18, color: Cores.primaria, fontFamily: "Poppins_700Bold" },
});
