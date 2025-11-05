"use client";

import { useEffect, useState } from "react";
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
import ManageMusicScreen from "./screens/ManageMusicScreen";
import UploadScreen from "./screens/UploadScreen";

import ProfileScreen from "./screens/ProfileScreen";

import ChatScreen from "./screens/ChatScreen";

// auth screens
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

/** Song shape */
export interface Song {
  _id: string;
  title: string;
  artist: string;
  audioUrl: string;
  imageUrl?: string;
  duration?: number;
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentAlbum, setCurrentAlbum] = useState<any | null>(null);

  const { user, initializeUser, isArtist } = useUserStore();
 useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // khởi tạo người dùng từ AsyncStorage
        await initializeUser();

        // nếu cần, có thể kiểm tra artist status từ API:
        // await checkArtistStatus();  // nếu bạn có hàm riêng

      } catch (e) {
        console.warn("Auth init failed:", e);
        Alert.alert("Error", "Không thể tải thông tin người dùng");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    // fallback timeout phòng trường hợp bị treo
    const t = setTimeout(() => mounted && setIsLoading(false), 1500);
    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [initializeUser]);

 
  const tabScreens: TabScreen[] = isArtist
    ? ["home", "library", "upload", "profile"]
    : ["home", "search", "chat" ,"profile"];

  const isTabScreen = (s: Screen): s is TabScreen =>
    tabScreens.includes(s as TabScreen);

  useEffect(() => {
    if (!isTabScreen(currentScreen)) {
      setCurrentScreen(tabScreens[0]);
    }
  }, [isArtist]);

  const goBack = () => setCurrentScreen("home");

  const normalizeToSong = (maybe: any): Song | null => {
    if (!maybe) return null;
    if (maybe._id && maybe.audioUrl) {
      return {
        _id: String(maybe._id),
        title: maybe.title || maybe.name || "Untitled",
        artist: maybe.artist || maybe.artistName || "Unknown Artist",
        audioUrl: maybe.audioUrl || maybe.url || "",
        imageUrl: maybe.imageUrl || maybe.image || undefined,
        duration: maybe.duration || 0,
      };
    }
    if (maybe.id || maybe.name || maybe.url) {
      return {
        _id: String(maybe.id || maybe._id || Date.now()),
        title: maybe.title || maybe.name || "Untitled",
        artist: maybe.artist || "Unknown Artist",
        audioUrl: maybe.url || maybe.audioUrl || "",
        imageUrl: maybe.image || maybe.imageUrl || undefined,
        duration: maybe.duration || 0,
      };
    }
    return null;
  };

  const handlePlay = (trackLike: any) => {
    const s = normalizeToSong(trackLike);
    if (!s) return;
    setCurrentSong(s);
    setCurrentScreen("detail");
  };

  const openDetail = () => {
    if (currentSong) setCurrentScreen("detail");
  };

  const openAlbum = (album: any) => {
    setCurrentAlbum(album);
    setCurrentScreen("album");
  };

  const mainPaddingBottom = currentSong ? 80 : 70;
  const hideMiniPlayerScreens: Screen[] = ["authLogin", "authSignup", "registerArtist", "profile"];
  const hideBottomTabScreens: Screen[] = ["authLogin", "authSignup", "registerArtist", "profile"];
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.main, { paddingBottom: mainPaddingBottom }]}>
          {currentScreen === "home" && (
            <HomeScreen
              onPlay={handlePlay}
              onSearch={() => setCurrentScreen("search")}
              onOpenAlbum={openAlbum}
              onOpenChat={() => setCurrentScreen("chat")}
            />
          )}

          {currentScreen === "search" && (
            <SearchScreen onBack={goBack} onPlay={handlePlay} />
          )}

          {currentScreen === "library" && (
            <LibraryScreen
              onBack={goBack}
              onPlay={handlePlay}
              onCreateAlbum={() => setCurrentScreen("createAlbum")}
              onManageAlbums={() => setCurrentScreen("manageAlbums")}
              onManageMusic={() => setCurrentScreen("manageMusic")}
            />
          )}

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
                onSuccess={() => setCurrentScreen("home")}
              />
            ))}

          {currentScreen === "authLogin" && (
            <AuthLoginScreen
              onBack={goBack}
              onSignup={() => setCurrentScreen("authSignup")}
              onSuccess={() => setCurrentScreen("profile")}
            />
          )}

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

          {currentScreen === "upload" && <UploadScreen onBack={goBack} />}

          {currentScreen === "detail" && currentSong && (
            <MusicDetailScreen track={currentSong} onBack={goBack} />
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

          {currentScreen === "chat" && (
            <ChatScreen onBack={() => setCurrentScreen("home")} />
          )}
        </View>

        {currentSong && !hideMiniPlayerScreens.includes(currentScreen) && (
          <MiniPlayer
            track={{
              name: currentSong.title,
              artist: currentSong.artist,
              image: currentSong.imageUrl,
              url: currentSong.audioUrl,
            }}
            onPress={openDetail}
          />
        )}

        {!hideBottomTabScreens.includes(currentScreen) && (
          <BottomTabBar
            currentScreen={
              isTabScreen(currentScreen) ? currentScreen : tabScreens[0]
            } // safe: already synced above
            availableTabs={tabScreens}
            onNavigate={(tab) => setCurrentScreen(tab)}
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
