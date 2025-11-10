import { Link } from "react-router-dom";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../lib/api";

import musicLibrary from "@/assets/music-library.png";
import musicUpload from "@/assets/music-upload-interface.png";
import socialMusic from "@/assets/social-music.png";

const features = [
  {
    title: "Vast Music Library",
    description:
      "Millions of songs from around the world, every music genre you love",
    image: musicLibrary,
    gradient: "from-purple-900 to-blue-900",
  },
  {
    title: "Free Album Publishing",
    description:
      "Artists can freely upload and manage their albums, share music with the world",
    image: musicUpload,
    gradient: "from-pink-900 to-purple-900",
  },
  {
    title: "Connect with Friends",
    description:
      "Connect with friends, share playlists, see what they're listening to and chat directly",
    image: socialMusic,
    gradient: "from-blue-900 to-teal-900",
  },
];

export default function HomePage() {
  const [featureIndex, setFeatureIndex] = useState(0);

  const [trendingSongs, setTrendingSongs] = useState([]);
  const [trendingAlbums, setTrendingAlbums] = useState([]);
  const [newestSongs, setNewestSongs] = useState([]);

  const [trendingSongStart, setTrendingSongStart] = useState(0);
  const [trendingAlbumStart, setTrendingAlbumStart] = useState(0);
  const [newestStart, setNewestStart] = useState(0);

  const [loading, setLoading] = useState(false);

  const itemsPerView = 4;

  // fetch home data
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/main/home");
        if (cancelled) return;

        setTrendingSongs(data.trendingSongs || []);
        setTrendingAlbums(data.trendingAlbums || []);
        setNewestSongs(data.newestSongs || []);

        setTrendingSongStart(0);
        setTrendingAlbumStart(0);
        setNewestStart(0);
      } catch (err) {
        console.error("Failed to load home data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const maxTrendingSongOffset = Math.max(
    0,
    (trendingSongs?.length || 0) - itemsPerView
  );
  const maxTrendingAlbumOffset = Math.max(
    0,
    (trendingAlbums?.length || 0) - itemsPerView
  );
  const maxNewestOffset = Math.max(
    0,
    (newestSongs?.length || 0) - itemsPerView
  );

  const visibleTrendingSongs = trendingSongs.slice(
    trendingSongStart,
    trendingSongStart + itemsPerView
  );
  const visibleTrendingAlbums = trendingAlbums.slice(
    trendingAlbumStart,
    trendingAlbumStart + itemsPerView
  );
  const visibleNewestSongs = newestSongs.slice(
    newestStart,
    newestStart + itemsPerView
  );

  const renderCardSkeletons = () => (
    <div className="grid grid-cols-4 gap-6">
      {Array.from({ length: itemsPerView }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white/5 p-4 rounded-lg animate-pulse flex flex-col gap-3"
        >
          <div className="w-full aspect-square rounded bg-white/10" />
          <div className="h-4 w-3/4 rounded bg-white/10" />
          <div className="h-3 w-1/2 rounded bg-white/10" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-8">
      {/* Hero carousel */}
      <div className="mb-12">
        <div className="relative rounded-2xl overflow-hidden h-96">
          <div
            className={`absolute inset-0 bg-linear-to-r ${features[featureIndex].gradient} transition-all duration-500`}
          >
            <img
              src={features[featureIndex].image || "/placeholder.svg"}
              alt={features[featureIndex].title}
              className="w-full h-full object-cover opacity-30"
            />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-center px-12">
            <h1 className="text-5xl font-bold mb-4 text-white">
              {features[featureIndex].title}
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl">
              {features[featureIndex].description}
            </p>
          </div>
          <div className="absolute bottom-6 right-6 flex gap-2 z-10">
            <button
              onClick={() =>
                setFeatureIndex((prev) =>
                  prev === 0 ? features.length - 1 : prev - 1
                )
              }
              className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={() =>
                setFeatureIndex((prev) =>
                  prev === features.length - 1 ? 0 : prev + 1
                )
              }
              className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setFeatureIndex(index)}
                className={`h-2 rounded-full transition ${
                  index === featureIndex ? "bg-white w-8" : "bg-white/50 w-2"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Trending Songs */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Trending Songs</h2>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setTrendingSongStart((prev) =>
                  Math.max(0, prev - itemsPerView)
                )
              }
              disabled={trendingSongStart === 0}
              className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() =>
                setTrendingSongStart((prev) =>
                  Math.min(maxTrendingSongOffset, prev + itemsPerView)
                )
              }
              disabled={trendingSongStart >= maxTrendingSongOffset}
              className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading ? (
          renderCardSkeletons()
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {visibleTrendingSongs.map((item) => (
              <Link
                key={item._id}
                to={`/music/${item._id}`}
                className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition group"
              >
                <div className="relative mb-4">
                  <img
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full aspect-square rounded object-cover"
                  />
                  <button className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-xl translate-y-2 group-hover:translate-y-0">
                    <Play className="h-5 w-5 text-black fill-black ml-0.5" />
                  </button>
                </div>
                <h3 className="font-semibold text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-400">{item.artistName}</p>
              </Link>
            ))}
            {!loading && visibleTrendingSongs.length === 0 && (
              <p className="text-sm text-gray-400 col-span-4">
                Chưa có bài hát nào.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Trending Albums */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Trending Albums</h2>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setTrendingAlbumStart((prev) =>
                  Math.max(0, prev - itemsPerView)
                )
              }
              disabled={trendingAlbumStart === 0}
              className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() =>
                setTrendingAlbumStart((prev) =>
                  Math.min(maxTrendingAlbumOffset, prev + itemsPerView)
                )
              }
              disabled={trendingAlbumStart >= maxTrendingAlbumOffset}
              className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading ? (
          renderCardSkeletons()
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {visibleTrendingAlbums.map((item) => (
              <Link
                key={item._id}
                to={`/album/${item._id}`}
                className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition group"
              >
                <div className="relative mb-4">
                  <img
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full aspect-square rounded object-cover"
                  />
                  <button className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-xl translate-y-2 group-hover:translate-y-0">
                    <Play className="h-5 w-5 text-black fill-black ml-0.5" />
                  </button>
                </div>
                <h3 className="font-semibold text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-400">
                  {item.artistName}
                  {typeof item.tracksCount === "number" &&
                    ` • ${item.tracksCount} tracks`}
                </p>
              </Link>
            ))}
            {!loading && visibleTrendingAlbums.length === 0 && (
              <p className="text-sm text-gray-400 col-span-4">
                Chưa có album nào.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Newest Songs */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Newest Songs</h2>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setNewestStart((prev) => Math.max(0, prev - itemsPerView))
              }
              disabled={newestStart === 0}
              className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() =>
                setNewestStart((prev) =>
                  Math.min(maxNewestOffset, prev + itemsPerView)
                )
              }
              disabled={newestStart >= maxNewestOffset}
              className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading ? (
          renderCardSkeletons()
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {visibleNewestSongs.map((item) => (
              <Link
                key={item._id}
                to={`/music/${item._id}`}
                className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition group"
              >
                <div className="relative mb-4">
                  <img
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full aspect-square rounded object-cover"
                  />
                  <button className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-xl translate-y-2 group-hover:translate-y-0">
                    <Play className="h-5 w-5 text-black fill-black ml-0.5" />
                  </button>
                </div>
                <h3 className="font-semibold text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-400">{item.artistName}</p>
              </Link>
            ))}
            {!loading && visibleNewestSongs.length === 0 && (
              <p className="text-sm text-gray-400 col-span-4">
                Chưa có bài hát mới.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
