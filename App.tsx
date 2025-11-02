"use client";

import { useEffect, useState } from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
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

// === COMPONENTS ===
import BottomTabBar from "./components/BottomTabBar";
import MiniPlayer from "./components/MiniPlayer";

// === TYPES ===
type TabScreen = "home" | "search" | "library" | "upload";
type Screen =
  | TabScreen
  | "detail"
  | "album"
  | "createAlbum"
  | "manageAlbums"
  | "manageMusic";

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

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <SplashScreen />;

  // === HANDLERS ===
  const handlePlay = (track: Track) => {
    setCurrentTrack(track);
    setCurrentScreen("detail");
  };

  const openDetail = () => {
    if (currentTrack) setCurrentScreen("detail");
  };

  const openAlbum = (album: Album) => {
    setCurrentAlbum(album);
    setCurrentScreen("album");
  };

  const goBack = () => {
    setCurrentScreen("home");
  };

  const isTabScreen = (screen: Screen): screen is TabScreen =>
    ["home", "search", "library", "upload"].includes(screen);

  const mainPaddingBottom = currentTrack ? 80 : 70;

  return (
    <SafeAreaViewRN style={styles.safeArea}>
      <View style={styles.container}>
        {/* MAIN CONTENT */}
        <View style={[styles.main, { paddingBottom: mainPaddingBottom }]}>
          {/* HOME */}
          {currentScreen === "home" && (
            <HomeScreen
              onPlay={handlePlay}
              onSearch={() => setCurrentScreen("search")}
              onOpenAlbum={openAlbum}
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

          {/* MUSIC DETAIL */}
          {currentScreen === "detail" && currentTrack && (
            <MusicDetailScreen track={currentTrack} onBack={goBack} />
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
              onEditAlbum={(id) => {
                setCurrentScreen("createAlbum");
              }}
            />
          )}

          {/* MANAGE MUSIC */}
          {currentScreen === "manageMusic" && (
            <ManageMusicScreen
              onBack={() => setCurrentScreen("library")}
              onUpload={() => setCurrentScreen("upload")}
            />
          )}
        </View>

        {/* MINI PLAYER */}
        {currentTrack && (
          <MiniPlayer track={currentTrack} onPress={openDetail} />
        )}

        {/* BOTTOM TAB BAR */}
        {isTabScreen(currentScreen) && (
          <BottomTabBar
            currentScreen={currentScreen}
            onNavigate={(screen: TabScreen) => setCurrentScreen(screen)}
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