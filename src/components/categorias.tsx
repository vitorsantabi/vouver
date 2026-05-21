import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { CATEGORIAS } from "../lib/tmdb";
import { Cores, Radius, Surface, Border } from "../utils/cores";

type Props = {
  ativa: number;
  onChange: (index: number) => void;
};

export default function Categorias({ ativa, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist"
    >
      {CATEGORIAS.map((cat, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.btn, ativa === index && styles.btnAtivo]}
          onPress={() => onChange(index)}
          activeOpacity={0.8}
          accessibilityRole="tab"
          accessibilityState={{ selected: ativa === index }}
          accessibilityLabel={cat.label}
        >
          <Text style={[styles.txt, ativa === index && styles.txtAtivo]}>
            {cat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 14,
  },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    minHeight: 44,
    borderRadius: Radius.lg,
    backgroundColor: Surface.card,
    borderWidth: 1,
    borderColor: Border.light,
    justifyContent: "center",
    alignItems: "center",
  },
  btnAtivo: {
    backgroundColor: Cores.primaria,
    borderColor: Cores.primaria,
  },
  txt: {
    color: Cores.primaria + "aa",
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
  },
  txtAtivo: {
    color: Cores.fundo,
    fontFamily: "Poppins_600SemiBold",
  },
});
