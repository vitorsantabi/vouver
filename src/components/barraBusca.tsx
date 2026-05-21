import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Cores, Radius, Surface, Border, Touch, TextColor } from "../utils/cores";

type Props = {
  value: string;
  onChange: (text: string) => void;
};

export default function BarraBusca({ value, onChange }: Props) {
  return (
    <View style={styles.wrapper} accessibilityRole="search">
      <Text style={styles.icon} accessibilityElementsHidden>🔍</Text>
      <TextInput
        style={styles.input}
        placeholder="Buscar filmes..."
        placeholderTextColor={Cores.primaria + "55"}
        value={value}
        onChangeText={onChange}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel="Campo de busca de filmes"
        accessibilityHint="Digite o nome do filme para buscar"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChange("")}
          hitSlop={Touch.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
        >
          <Text style={styles.clear}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Surface.card,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Border.light,
    gap: 10,
    minHeight: Touch.minHeight,
  },
  icon: { fontSize: 16 },
  input: {
    flex: 1,
    color: TextColor.primary,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    padding: 0,
    paddingVertical: 10,
  },
  clear: {
    color: Cores.primaria + "88",
    fontSize: 14,
    padding: 4,
  },
});
