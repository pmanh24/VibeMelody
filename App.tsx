// App.tsx
"use client";

import { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// screens có sẵn của bạn
import SplashScreen from "./screens/SplashScreen";
import HomeScreen from "./screens/HomeScreen";
import SearchScreen from "./screens/SearchScreen";
import LibraryScreen from "./screens/LibraryScreen";
import MusicDetailScreen from "./screens/MusicDetailScreen";
import AlbumDetailScreen from "./screens/AlbumDetailScreen";
import CreateAlbumScreen from "./screens/CreateAlbumScreen";
import ManageAlbumsScreen from "./screens/ManageAlbumsScreen";
import ManageMusicScreen from "./screens/ManageMusicScreen";
import ProfileScreen from "./screens/ProfileScreen";

// auth screens mới
import AuthLoginScreen from "./screens/AuthLoginScreen";
import AuthSignupScreen from "./screens/AuthSignupScreen";
import RegisterArtistScreen from "./screens/RegisterArtistScreen"; 

// components
import BottomTabBar, { TabScreen } from "./components/BottomTabBar";
import MiniPlayer from "./components/MiniPlayer";

// store
import { useUserStore } from "./store/useUserStore";

type Screen =
  | TabScreen
  | "detail"
  | "album"
  | "createAlbum"
  | "manageAlbums"
  | "manageMusic"
  | "authLogin"
  | "authSignup"
  | "registerArtist";

interface Track {
  id: string;
  name: string;
  artist: string;
  image: any;
  duration: number;
  album?: string;
  date?: string;
}
interface Album {
  id: string;
  name: string;
  artist: string;
  coverImages: any[];
  type: string;
  totalTracks: number;
  duration: string;
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);

  const user = useUserStore((s) => s.user);
  const checkAuth = useUserStore((s) => s.checkAuth);

  useEffect(() => {
    (async () => {
      await checkAuth(); // gọi profile nếu có token
      setIsLoading(false); // không chờ API vô hạn
    })();
  }, []);

  if (isLoading) return <SplashScreen />;

  const isTabScreen = (s: Screen): s is TabScreen =>
    ["home", "search", "library", "profile"].includes(s);

  const handlePlay = (track: Track) => {
    setCurrentTrack(track);
    setCurrentScreen("detail");
  };
  const openDetail = () => currentTrack && setCurrentScreen("detail");
  const openAlbum = (a: Album) => {
    setCurrentAlbum(a);
    setCurrentScreen("album");
  };
  const goBack = () => setCurrentScreen("home");

  const mainPaddingBottom = currentTrack ? 80 : 70;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.main, { paddingBottom: mainPaddingBottom }]}>
          {currentScreen === "home" && (
            <HomeScreen
              onPlay={handlePlay}
              onSearch={() => setCurrentScreen("search")}
              onOpenAlbum={openAlbum}
            />
          )}

          {currentScreen === "search" && (
            <SearchScreen onBack={goBack} onPlay={handlePlay} />
          )}

          {currentScreen === "library" && (
            <LibraryScreen
              onBack={goBack}
              onPlay={handlePlay}
              onCreateAlbum={() =>
                user
                  ? setCurrentScreen("createAlbum")
                  : setCurrentScreen("authLogin")
              }
              onManageAlbums={() =>
                user
                  ? setCurrentScreen("manageAlbums")
                  : setCurrentScreen("authLogin")
              }
              onManageMusic={() =>
                user
                  ? setCurrentScreen("manageMusic")
                  : setCurrentScreen("authLogin")
              }
            />
          )}

          {/* PROFILE tab: nếu chưa login -> authLogin; đã login -> ProfileScreen */}
          {currentScreen === "profile" &&
            (user ? (
              <ProfileScreen
                onBack={goBack}
                onNavigate={(route) => {
                  switch (route) {
                    case "registerArtist":
                      // ✅ mở lại: chuyển sang màn đăng ký artist
                      setCurrentScreen("registerArtist");
                      break;
                    case "logout":
                      useUserStore.getState().logout();
                      setCurrentScreen("home");
                      break;
                    default:
                      setCurrentScreen("home");
                  }
                }}
              />
            ) : (
              <AuthLoginScreen
                onBack={goBack}
                onSignup={() => setCurrentScreen("authSignup")}
                onSuccess={() => setCurrentScreen("profile")}
              />
            ))}

          {currentScreen === "authLogin" && (
            <AuthLoginScreen
              onBack={goBack}
              onSignup={() => setCurrentScreen("authSignup")}
              onSuccess={() => setCurrentScreen("profile")}
            />
          )}

            {/* REGISTER ARTIST (nếu có) */}
          {currentScreen === "registerArtist" && (
            <RegisterArtistScreen
              onBack={() => setCurrentScreen("registerArtist")}
              onSubscribe={(plan) => {
                Alert.alert("Thành công", `Đăng ký ${plan.title} thành công!`);
                setCurrentScreen("registerArtist");
              }}
            />
          )}


          {currentScreen === "authSignup" && (
            <AuthSignupScreen
              onBack={() => setCurrentScreen("authLogin")}
              onLogin={() => setCurrentScreen("authLogin")}
              onSuccess={() => setCurrentScreen("profile")}
            />
          )}

          {currentScreen === "detail" && currentTrack && (
            <MusicDetailScreen track={currentTrack} onBack={goBack} />
          )}

          {currentScreen === "createAlbum" && (
            <CreateAlbumScreen
              onBack={() => setCurrentScreen("library")}
              onSave={() => setCurrentScreen("library")}
            />
          )}

          {currentScreen === "album" && currentAlbum && (
            <AlbumDetailScreen onBack={goBack} onPlayTrack={handlePlay} />
          )}

          {currentScreen === "manageAlbums" && (
            <ManageAlbumsScreen
              onBack={() => setCurrentScreen("library")}
              onCreateAlbum={() => setCurrentScreen("createAlbum")}
              onEditAlbum={() => setCurrentScreen("createAlbum")}
            />
          )}

          {currentScreen === "manageMusic" && (
            <ManageMusicScreen
              onBack={() => setCurrentScreen("library")}
              onUpload={() => setCurrentScreen("profile")}
            />
          )}
        </View>

        {currentTrack && (
          <MiniPlayer track={currentTrack} onPress={openDetail} />
        )}

        {isTabScreen(currentScreen) && (
          <BottomTabBar
            currentScreen={currentScreen as TabScreen}
            onNavigate={(tab) => {
              if (tab === "profile") {
                setCurrentScreen("profile"); // gating ở nhánh render
                return;
              }
              setCurrentScreen(tab);
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0f172a" },
  container: { flex: 1 },
  main: { flex: 1 },
});
