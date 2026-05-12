import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { CATEGORIAS } from "../lib/tmdb";
import { Cores } from "../utils/cores";

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
    >
      {CATEGORIAS.map((cat, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.btn, ativa === index && styles.btnAtivo]}
          onPress={() => onChange(index)}
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
    paddingHorizontal: 30,
    paddingVertical: 10,
    height: 50,
    borderRadius: 20,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: Cores.primaria + "30",
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
    fontSize: 15,
  },
  txtAtivo: {
    color: Cores.fundo,
  },
});
