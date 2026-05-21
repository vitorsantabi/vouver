import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Cores, Radius, Surface } from "../utils/cores";

function PulsingBlock({ style }: { style?: StyleProp<ViewStyle> }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return <Animated.View style={[styles.block, { opacity }, style]} />;
}

export default function SkeletonCard() {
  return (
    <View style={styles.card}>
      <PulsingBlock style={styles.poster} />
      <View style={styles.info}>
        <PulsingBlock style={styles.titleLine} />
        <PulsingBlock style={styles.subtitleLine} />
        <PulsingBlock style={styles.textLine} />
      </View>
    </View>
  );
}

/** Renders a horizontal row of skeleton cards */
export function SkeletonRow({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 170,
    borderRadius: Radius.card,
    backgroundColor: Surface.card,
    overflow: "hidden",
    marginRight: 12,
    borderWidth: 1,
    borderColor: Cores.primaria + "10",
  },
  poster: {
    width: "100%",
    height: 240,
    borderRadius: 0,
  },
  info: {
    padding: 10,
    gap: 8,
  },
  titleLine: {
    height: 14,
    width: "80%",
    borderRadius: 4,
  },
  subtitleLine: {
    height: 10,
    width: "40%",
    borderRadius: 4,
  },
  textLine: {
    height: 10,
    width: "65%",
    borderRadius: 4,
  },
  block: {
    backgroundColor: Cores.primaria + "18",
    borderRadius: 6,
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
