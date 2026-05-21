import { useCallback, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Cores, Radius, Touch } from "../utils/cores";

type BotaoProps = Omit<PressableProps, "style"> & {
  titulo: string;
  corFundo?: string;
  carregando?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function Botao({
  titulo,
  corFundo = Cores.primaria,
  carregando = false,
  style,
  disabled,
  ...rest
}: BotaoProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scale]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  }, [scale]);

  const isDisabled = disabled || carregando;

  return (
    <Animated.View
      style={[
        styles.botao,
        { backgroundColor: corFundo, transform: [{ scale }] },
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <Pressable
        style={styles.pressable}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={titulo}
        accessibilityState={{ disabled: isDisabled, busy: carregando }}
        {...rest}
      >
        {carregando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.texto}>{titulo}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  botao: {
    height: Touch.minHeight + 2, // 50px
    borderRadius: Radius.pill,
    overflow: "hidden",
    width: "80%",
  },
  pressable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  disabled: {
    opacity: 0.5,
  },
  texto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 0.5,
  },
});
