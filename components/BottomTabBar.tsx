// components/BottomTabBar.tsx
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Home, Search, ListMusic, CircleUser } from "lucide-react-native";

export type TabScreen = "home" | "search" | "library" | "profile";

interface Props {
  currentScreen: TabScreen;
  onNavigate: (screen: TabScreen) => void;
}

const tabs: { name: string; screen: TabScreen; icon: any }[] = [
  { name: "Home", screen: "home", icon: Home },
  { name: "Search", screen: "search", icon: Search },
  { name: "Library", screen: "library", icon: ListMusic },
  { name: "Profile", screen: "profile", icon: CircleUser },
];

export default function BottomTabBar({ currentScreen, onNavigate }: Props) {
  return (
    <View style={styles.container}>
      {tabs.map((t) => {
        const isActive = currentScreen === t.screen;
        const Icon = t.icon;
        return (
          <TouchableOpacity key={t.screen} style={styles.tab} onPress={() => onNavigate(t.screen)} activeOpacity={0.9}>
            <Icon size={24} color={isActive ? "#60a5fa" : "#94a3b8"} />
            <Text style={[styles.label, isActive && styles.labelActive]}>{t.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 70,
    backgroundColor: "#1e293b",
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  tab: { flex: 1, justifyContent: "center", alignItems: "center", gap: 4 },
  label: { fontSize: 10, color: "#94a3b8" },
  labelActive: { color: "#60a5fa", fontWeight: "600" },
});
