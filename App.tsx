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
import UploadScreen from "./screens/UploadScreen";

import ProfileScreen from "./screens/ProfileScreen";

import ChatScreen from "./screens/ChatScreen";


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

/**
 * Song shape expected by the MusicDetailScreen you provided.
 * Backend -> { _id, title, artist, audioUrl, imageUrl, duration? }
 */
export interface Song {
  _id: string;
  title: string;
  artist: string;
  audioUrl: string;
  imageUrl?: string;
  duration?: number;
}
interface Album {
  id: string;
}

/**
 * MiniPlayer's smaller track shape (if your MiniPlayer expects
 * id/name/artist/image/url — adjust if your MiniPlayer uses different keys)
 */
export interface MiniTrack {
  id: string | number;
  name: string;
  artist: string;
  image?: string;
  url?: string;
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");

  // store the canonical Song for MusicDetailScreen
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentAlbum, setCurrentAlbum] = useState<any | null>(null);

  const user = useUserStore((s) => s.user);
  const checkAuth = useUserStore((s) => s.checkAuth);

  useEffect(() => {
    (async () => {
      await checkAuth(); // gọi profile nếu có token
      setIsLoading(false); // không chờ API vô hạn
    })();
    const t = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  if (isLoading) return <SplashScreen />;


  const isTabScreen = (s: Screen): s is TabScreen =>
    ["home", "search", "library", "upload", "chat","profile"].includes(s);;

  
  const goBack = () => setCurrentScreen("home");
  // === normalize incoming "track-like" objects into Song ===
  const normalizeToSong = (maybe: any): Song | null => {
    if (!maybe) return null;

    // if it's already a Song (has _id and audioUrl) return directly
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

    // if it has id/name/url style, convert
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

  // call when user presses Play on a track (from HomeScreen, album, etc.)
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

          {/* CHAT */}
          {currentScreen === "chat" && (
            <ChatScreen onBack={() => setCurrentScreen("home")} />
          )}
        </View>

{/* 
        {currentTrack && (
          <MiniPlayer track={currentTrack} onPress={openDetail} /> */}

        {/* MINI PLAYER */}
        {currentSong && (
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

        {isTabScreen(currentScreen) && (
          <BottomTabBar
            currentScreen={currentScreen as TabScreen}
            onNavigate={(tab) => {
              if (tab === "profile") {
                setCurrentScreen("profile"); 
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
