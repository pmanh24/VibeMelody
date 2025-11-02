// components/BottomTabBar.tsx
import { View, TouchableOpacity, Text, StyleSheet } from "react-native"
import { Home, Search, ListMusic, Upload } from "lucide-react-native"

// Chỉ nhận 4 trang chính
type TabScreen = "home" | "search" | "library" | "upload"

interface Props {
  currentScreen: TabScreen
  onNavigate: (screen: TabScreen) => void
}

const tabs = [
  { name: "Home", icon: Home, screen: "home" as TabScreen },
  { name: "Search", icon: Search, screen: "search" as TabScreen },
  { name: "Library", icon: ListMusic, screen: "library" as TabScreen },
  { name: "Upload", icon: Upload, screen: "upload" as TabScreen },
]

export default function BottomTabBar({ currentScreen, onNavigate }: Props) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.screen
        return (
          <TouchableOpacity
            key={tab.screen}
            style={styles.tab}
            onPress={() => onNavigate(tab.screen)}
          >
            <tab.icon size={24} color={isActive ? "#60a5fa" : "#94a3b8"} />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
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
  label: { fontSize: 10, color: "#94a3b8", fontFamily: "Geist" },
  labelActive: { color: "#60a5fa", fontWeight: "600" },
})