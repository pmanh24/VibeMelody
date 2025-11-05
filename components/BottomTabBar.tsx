import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Home, Search, ListMusic, Upload, MessageCircle, CircleUser } from "lucide-react-native";

// 6 tab có thể hiển thị
export type TabScreen = "home" | "search" | "library" | "upload" | "chat" | "profile";

interface Props {
  currentScreen: TabScreen;
  availableTabs: TabScreen[]; // ✅ thêm prop mới
  onNavigate: (screen: TabScreen) => void;
}

// ✅ map đầy đủ thông tin tab
const allTabs = [
  { name: "Home", icon: Home, screen: "home" as TabScreen },
  { name: "Search", icon: Search, screen: "search" as TabScreen },
  { name: "Library", icon: ListMusic, screen: "library" as TabScreen },
  { name: "Upload", icon: Upload, screen: "upload" as TabScreen },
  { name: "Chat", icon: MessageCircle, screen: "chat" as TabScreen },
  { name: "Profile", icon: CircleUser, screen: "profile" as TabScreen },
];

export default function BottomTabBar({ currentScreen, availableTabs, onNavigate }: Props) {
  // ✅ chỉ render các tab nằm trong danh sách cho phép
  const visibleTabs = allTabs.filter((tab) => availableTabs.includes(tab.screen));

  return (
    <View style={styles.container}>
      {visibleTabs.map((tab) => {
        const isActive = currentScreen === tab.screen;
        const Icon = tab.icon;

        return (
          <TouchableOpacity
            key={tab.screen}
            style={styles.tab}
            onPress={() => onNavigate(tab.screen)}
            activeOpacity={0.7}
          >
            <Icon
              size={24}
              color={isActive ? "#60a5fa" : "#94a3b8"}
              fill={isActive ? "#60a5fa" : "none"}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.name}
            </Text>
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
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontSize: 10,
    color: "#94a3b8",
    fontFamily: "Geist",
  },
  labelActive: {
    color: "#60a5fa",
    fontWeight: "600",
  },
});
