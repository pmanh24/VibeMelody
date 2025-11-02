"use client";

import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView as SafeAreaViewRN } from "react-native-safe-area-context";

// === SCREENS ===
import SplashScreen from "./screens/SplashScreen";
import HomeScreen from "./screens/HomeScreen";
import SearchScreen from "./screens/SearchScreen";
import LibraryScreen from "./screens/LibraryScreen";
import UploadScreen from "./screens/UploadScreen";
import MusicDetailScreen from "./screens/MusicDetailScreen";
import AlbumDetailScreen from "./screens/AlbumDetailScreen";
import CreateAlbumScreen from "./screens/CreateAlbumScreen";
import ManageAlbumsScreen from "./screens/ManageAlbumsScreen";
import ManageMusicScreen from "./screens/ManageMusicScreen";
import ChatScreen from "./screens/ChatScreen";

// === COMPONENTS ===
import BottomTabBar from "./components/BottomTabBar";
import MiniPlayer from "./components/MiniPlayer";

// === TYPES ===
type TabScreen = "home" | "search" | "library" | "upload" | "chat";
type Screen =
  | TabScreen
  | "detail"
  | "album"
  | "createAlbum"
  | "manageAlbums"
  | "manageMusic";

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

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  if (isLoading) return <SplashScreen />;

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

  const goBack = () => setCurrentScreen("home");

  const isTabScreen = (screen: Screen): screen is TabScreen =>
    ["home", "search", "library", "upload", "chat"].includes(screen);

  const mainPaddingBottom = currentSong ? 80 : 70;

  return (
    <SafeAreaViewRN style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.main, { paddingBottom: mainPaddingBottom }]}>
          {/* HOME */}
          {currentScreen === "home" && (
            <HomeScreen
              onPlay={handlePlay}
              onSearch={() => setCurrentScreen("search")}
              onOpenAlbum={openAlbum}
              onOpenChat={() => setCurrentScreen("chat")}
            />
          )}

          {/* SEARCH */}
          {currentScreen === "search" && (
            <SearchScreen onBack={goBack} onPlay={handlePlay} />
          )}

          {/* LIBRARY */}
          {currentScreen === "library" && (
            <LibraryScreen
              onBack={goBack}
              onPlay={handlePlay}
              onCreateAlbum={() => setCurrentScreen("createAlbum")}
              onManageAlbums={() => setCurrentScreen("manageAlbums")}
              onManageMusic={() => setCurrentScreen("manageMusic")}
            />
          )}

          {/* UPLOAD */}
          {currentScreen === "upload" && <UploadScreen onBack={goBack} />}

          {/* MUSIC DETAIL — pass canonical Song */}
          {currentScreen === "detail" && currentSong && (
            <MusicDetailScreen track={currentSong} onBack={goBack} />
          )}

          {/* CREATE ALBUM */}
          {currentScreen === "createAlbum" && (
            <CreateAlbumScreen
              onBack={() => setCurrentScreen("library")}
              onSave={() => setCurrentScreen("library")}
            />
          )}

          {/* ALBUM DETAIL */}
          {currentScreen === "album" && currentAlbum && (
            <AlbumDetailScreen onBack={goBack} onPlayTrack={handlePlay} />
          )}

          {/* MANAGE ALBUMS */}
          {currentScreen === "manageAlbums" && (
            <ManageAlbumsScreen
              onBack={() => setCurrentScreen("library")}
              onCreateAlbum={() => setCurrentScreen("createAlbum")}
              onEditAlbum={() => setCurrentScreen("createAlbum")}
            />
          )}

          {/* MANAGE MUSIC */}
          {currentScreen === "manageMusic" && (
            <ManageMusicScreen
              onBack={() => setCurrentScreen("library")}
              onUpload={() => setCurrentScreen("upload")}
            />
          )}

          {/* CHAT */}
          {currentScreen === "chat" && (
            <ChatScreen onBack={() => setCurrentScreen("home")} />
          )}
        </View>

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

        {/* BOTTOM TAB BAR */}
        {isTabScreen(currentScreen) && (
          <BottomTabBar
            currentScreen={currentScreen}
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        )}
      </View>
    </SafeAreaViewRN>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0f172a" },
  container: { flex: 1 },
  main: { flex: 1 },
});
