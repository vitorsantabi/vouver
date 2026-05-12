import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Cores } from "../utils/cores";

type Props = {
  value: string;
  onChange: (text: string) => void;
};

export default function BarraBusca({ value, onChange }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        style={styles.input}
        placeholder="Buscar filmes..."
        placeholderTextColor={Cores.primaria + "55"}
        value={value}
        onChangeText={onChange}
        returnKeyType="search"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChange("")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
    backgroundColor: "#111827",
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Cores.primaria + "30",
    gap: 10,
  },
  icon: { fontSize: 16 },
  input: {
    flex: 1,
    color: "#f1f5f9",
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    padding: 0,
  },
  clear: {
    color: Cores.primaria + "88",
    fontSize: 14,
  },
});
