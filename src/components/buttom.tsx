import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
} from "react-native";
import { Cores } from "../utils/cores";

type BotaoProps = TouchableOpacityProps & {
  titulo: string;
  corFundo?: string;
  carregando?: boolean;
};

export default function Botao({
  titulo,
  corFundo = Cores.primaria,
  carregando = false,
  style,
  disabled,
  ...rest
}: BotaoProps) {
  return (
    <TouchableOpacity
      style={[styles.botao, { backgroundColor: corFundo }, style]}
      activeOpacity={0.8}
      disabled={disabled || carregando}
      {...rest}
    >
      {carregando ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.texto}>{titulo}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    height: 50,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    marginTop: 12,
    width: "80%",
  },
  texto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
