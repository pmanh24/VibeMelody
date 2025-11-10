// App.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// screens
import SplashScreen from "./screens/SplashScreen";
import HomeScreen from "./screens/HomeScreen";
import SearchScreen from "./screens/SearchScreen";
import LibraryScreen from "./screens/LibraryScreen";
import MusicDetailScreen from "./screens/MusicDetailScreen";
import AlbumDetailScreen from "./screens/AlbumDetailScreen";
import CreateAlbumScreen from "./screens/CreateAlbumScreen";
import ManageAlbumsScreen from "./screens/ManageAlbumsScreen";
import UploadScreen from "./screens/UploadScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ChatScreen from "./screens/ChatScreen";
import AuthLoginScreen from "./screens/AuthLoginScreen";
import AuthSignupScreen from "./screens/AuthSignupScreen";
import RegisterArtistScreen from "./screens/RegisterArtistScreen";
import SocketProvider from "./providers/SocketProvider";
// components
import BottomTabBar, { TabScreen } from "./components/BottomTabBar";
import MiniPlayer from "./components/MiniPlayer";

// store
import { useUserStore } from "./store/useUserStore";

// types
export interface Song {
  _id: string;
  title: string;
  artist: string;
  audioUrl: string;
  imageUrl?: string;
  duration?: number;
}

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

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentAlbum, setCurrentAlbum] = useState<any | null>(null);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);

  const user = useUserStore((s) => s.user);
  const checkAuth = useUserStore((s) => s.checkAuth);

  useEffect(() => {
    (async () => {
      await checkAuth();
      setIsLoading(false);
    })();
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <SplashScreen />;

  const isTabScreen = (s: Screen): s is TabScreen =>
    ["home", "search", "library", "upload", "chat", "profile"].includes(s);

  const goBack = () => setCurrentScreen("home");

  const normalizeToSong = (maybe: any): Song | null => {
    if (!maybe) return null;
    return {
      _id: String(maybe._id || maybe.id || Date.now()),
      title: maybe.title || maybe.name || "Untitled",
      artist: maybe.artist || maybe.artistName || "Unknown Artist",
      audioUrl: maybe.audioUrl || maybe.url || "",
      imageUrl: maybe.imageUrl || maybe.image || undefined,
      duration: maybe.duration || 0,
    };
  };

  const handlePlay = (trackLike: any) => {
    const song = normalizeToSong(trackLike);
    if (!song) return;
    setCurrentSong(song);
    setCurrentScreen("detail");
  };

  const mainPaddingBottom = currentSong ? 80 : 70;

  return (
    <SocketProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={[styles.main, { paddingBottom: mainPaddingBottom }]}>
            {/* Home */}
            {currentScreen === "home" && (
              <HomeScreen
                onPlay={handlePlay}
                onSearch={() => setCurrentScreen("search")}
                onOpenAlbum={(a) => {
                  setCurrentAlbum(a);
                  setCurrentScreen("album");
                }}
                onOpenSong={(id) => {
                  setCurrentSongId(id);
                  setCurrentScreen("detail");
                }}
                onOpenChat={() => setCurrentScreen("chat")}
              />
            )}

            {/* Search */}
            {currentScreen === "search" && (
              <SearchScreen onBack={goBack} onPlay={handlePlay} />
            )}

            {/* Library */}
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

            {/* Profile */}
            {currentScreen === "profile" &&
              (user ? (
                <ProfileScreen
                  onBack={goBack}
                  onNavigate={(route) => {
                    switch (route) {
                      case "registerArtist":
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

            {/* Auth */}
            {currentScreen === "authLogin" && (
              <AuthLoginScreen
                onBack={goBack}
                onSignup={() => setCurrentScreen("authSignup")}
                onSuccess={() => setCurrentScreen("profile")}
              />
            )}

            {currentScreen === "authSignup" && (
              <AuthSignupScreen
                onBack={() => setCurrentScreen("authLogin")}
                onLogin={() => setCurrentScreen("authLogin")}
                onSuccess={() => setCurrentScreen("profile")}
              />
            )}

            {/* Register Artist */}
            {currentScreen === "registerArtist" && (
              <RegisterArtistScreen
                onBack={goBack}
                onSubscribe={(plan) => {
                  Alert.alert(
                    "Thành công",
                    `Đăng ký ${plan.title} thành công!`
                  );
                  setCurrentScreen("profile");
                }}
              />
            )}

            {/* Upload */}
            {currentScreen === "upload" && <UploadScreen onBack={goBack} />}

            {/* Music detail */}
            {currentScreen === "detail" && currentSongId && (
              <MusicDetailScreen songId={currentSongId} onBack={goBack} />
            )}
            {/* Album detail */}
            {currentScreen === "album" && currentAlbum && (
              <AlbumDetailScreen
                album={currentAlbum}
                onBack={goBack}
                onPlayTrack={handlePlay}
              />
            )}

            {/* Manage */}
            {currentScreen === "createAlbum" && (
              <CreateAlbumScreen
                onBack={() => setCurrentScreen("library")}
                onSave={() => setCurrentScreen("library")}
              />
            )}

            {currentScreen === "manageAlbums" && (
              <ManageAlbumsScreen
                onBack={() => setCurrentScreen("library")}
                onCreateAlbum={() => setCurrentScreen("createAlbum")}
                onEditAlbum={() => setCurrentScreen("createAlbum")}
              />
            )}

            {/* Chat */}
            {currentScreen === "chat" && (
              <ChatScreen onBack={() => setCurrentScreen("home")} />
            )}
          </View>

          {/* Mini player */}
          {currentSong && (
            <MiniPlayer
              track={{
                name: currentSong.title,
                artist: currentSong.artist,
                image: currentSong.imageUrl,
                url: currentSong.audioUrl,
              }}
              onPress={() => setCurrentScreen("detail")}
            />
          )}

          {/* Bottom tabs */}
          {isTabScreen(currentScreen) && (
            <BottomTabBar
              currentScreen={currentScreen as TabScreen}
              onNavigate={(tab) => setCurrentScreen(tab)}
            />
          )}
        </View>
      </SafeAreaView>
    </SocketProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0f172a" },
  container: { flex: 1 },
  main: { flex: 1 },
});
