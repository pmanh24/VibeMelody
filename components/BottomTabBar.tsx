// src/components/BottomTabBar.tsx
import React, { useMemo } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import {
  Home,
  Search,
  ListMusic,
  Upload,
  MessageCircle,
  CircleUser,
} from "lucide-react-native";
import { useUserStore } from "../store/useUserStore";

export type TabScreen =
  | "home"
  | "search"
  | "library"
  | "upload"
  | "chat"
  | "profile";

interface Props {
  currentScreen: TabScreen | "artistProfile";
  onNavigate: (screen: TabScreen) => void;
}

type TabConfig = {
  name: string;
  icon: React.ComponentType<{ size?: number; color?: string; fill?: string }>;
  screen: TabScreen;
};

export default function BottomTabBar({ currentScreen, onNavigate }: Props) {
  const user = useUserStore((s) => s.user as any);
  const isArtist = !!(user && user.isArtist);

  const tabs = useMemo<TabConfig[]>(() => {
    if (isArtist) {
      // ARTIST: có Library + Upload
      return [
        { name: "Home", icon: Home, screen: "home" },
        { name: "Search", icon: Search, screen: "search" },
        { name: "Library", icon: ListMusic, screen: "library" }, // manage music + albums
        { name: "Upload", icon: Upload, screen: "upload" },
        { name: "Chat", icon: MessageCircle, screen: "chat" },
        { name: "Profile", icon: CircleUser, screen: "profile" },
      ];
    }

    // USER THƯỜNG: không có Library, không có Upload
    return [
      { name: "Home", icon: Home, screen: "home" },
      { name: "Search", icon: Search, screen: "search" },
      { name: "Chat", icon: MessageCircle, screen: "chat" },
      { name: "Profile", icon: CircleUser, screen: "profile" },
    ];
  }, [isArtist]);

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive =
          tab.screen === "profile"
            ? currentScreen === "profile" || currentScreen === "artistProfile"
            : currentScreen === tab.screen;
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
    paddingBottom: 0,
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
