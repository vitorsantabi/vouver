import { Tabs } from "expo-router";
import { Platform, StyleSheet, Text } from "react-native";
import { Cores, Surface, Border } from "../../utils/cores";

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <Text style={[styles.icon, focused && styles.iconFocused]}>{icon}</Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Cores.primaria,
        tabBarInactiveTintColor: Cores.primaria + "55",
        tabBarLabelStyle: styles.label,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ focused }) => <TabIcon icon="🔍" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="listas"
        options={{
          title: "Listas",
          tabBarIcon: ({ focused }) => <TabIcon icon="📋" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Surface.sheet,
    borderTopWidth: 1,
    borderTopColor: Border.subtle,
    height: Platform.select({ ios: 85, android: 64 }),
    paddingBottom: Platform.select({ ios: 28, android: 8 }),
    paddingTop: 6,
    elevation: 0,
  },
  label: {
    fontFamily: "Poppins_500Medium",
    fontSize: 10,
    marginTop: 2,
  },
  icon: {
    fontSize: 20,
    opacity: 0.5,
  },
  iconFocused: {
    opacity: 1,
  },
});
