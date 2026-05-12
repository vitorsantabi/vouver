import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { Cores } from "../utils/cores";

type CampoInputProps = TextInputProps & {
  label?: string;
  senhaToggle?: boolean;
};

export default function CampoInput({
  label,
  senhaToggle = false,
  secureTextEntry,
  style,
  ...rest
}: CampoInputProps) {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const ehSenha = secureTextEntry || senhaToggle;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Cores.primaria + "99"}
          secureTextEntry={ehSenha && !mostrarSenha}
          {...rest}
        />
        {ehSenha && (
          <TouchableOpacity
            style={styles.toggle}
            onPress={() => setMostrarSenha((v) => !v)}
          >
            <Text style={styles.toggleText}>{mostrarSenha ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 16,
    width: "80%",
  },
  label: {
    color: Cores.fundo,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C2B4B",
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Cores.primaria + "55",
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  toggle: {
    paddingHorizontal: 14,
  },
  toggleText: {
    fontSize: 18,
  },
});
