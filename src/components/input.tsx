import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { Cores, Radius, Surface, Border, Touch } from "../utils/cores";

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
  const [isFocused, setIsFocused] = useState(false);

  const ehSenha = secureTextEntry || senhaToggle;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label} accessibilityRole="text">
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
        ]}
      >
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Cores.primaria + "77"}
          secureTextEntry={ehSenha && !mostrarSenha}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={label}
          {...rest}
        />
        {ehSenha && (
          <TouchableOpacity
            style={styles.toggle}
            onPress={() => setMostrarSenha((v) => !v)}
            hitSlop={Touch.hitSlop}
            accessibilityRole="button"
            accessibilityLabel={
              mostrarSenha ? "Ocultar senha" : "Mostrar senha"
            }
          >
            <Text style={styles.toggleText}>
              {mostrarSenha ? "🙈" : "👁️"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    width: "85%",
  },
  label: {
    color: Cores.fundo,
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 6,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Surface.input,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: Border.medium,
  },
  inputWrapperFocused: {
    borderColor: Cores.primaria,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    minHeight: Touch.minHeight,
  },
  toggle: {
    paddingHorizontal: 14,
    minHeight: Touch.minHeight,
    justifyContent: "center",
  },
  toggleText: {
    fontSize: 18,
  },
});
