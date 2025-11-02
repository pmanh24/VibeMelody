"use client"

import { useEffect, useState } from "react"

export default function SplashScreen() {
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsLoading(false)
          return 100
        }
        return prev + Math.random() * 25
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-blue-950 to-slate-950" />

      {/* Diagonal accent shapes for visual interest */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-800/20 rounded-full blur-3xl -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-900/30 rounded-full blur-3xl -ml-40 -mb-40" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-16 px-6 w-full max-w-sm">
        <div className="flex flex-col items-center gap-8">
          <div className="relative w-40 h-40">
            {/* Outer glass border */}
            <div className="absolute inset-0 rounded-full border-2 border-white/30 backdrop-blur-sm shadow-2xl" />

            {/* Rotating concentric circles */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              {/* Outer rotating ring */}
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-300 border-r-blue-400"
                style={{
                  animation: "spin 3s linear infinite",
                }}
              />

              {/* Middle rotating ring */}
              <div
                className="absolute inset-4 rounded-full border-3 border-transparent border-b-blue-400 border-l-blue-300"
                style={{
                  animation: "spin 4s linear infinite reverse",
                }}
              />

              {/* Inner gradient circle */}
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 opacity-80" />

              {/* Center dark circle */}
              <div className="absolute inset-12 rounded-full bg-slate-950" />
            </div>
          </div>

          <div className="text-center space-y-3">
            <h1
              className="text-5xl font-bold text-white tracking-tight"
              style={{ fontFamily: "'Dancing Script', cursive" }}
            >
              Vibe Melody
            </h1>
            <p className="text-sm text-slate-300 font-light">Ultimate solution to your media capabilities</p>
          </div>
        </div>

        <div className="w-full space-y-4">
          <div className="flex gap-1 items-center justify-center h-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                style={{
                  animation: `pulse 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>

          <div className="h-0.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-300 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

    <style>{`
      @keyframes pulse {
        0%, 100% {
        opacity: 0.4;
        }
        50% {
        opacity: 1;
        }
      }
      
      @keyframes spin {
        from {
        transform: rotate(0deg);
        }
        to {
        transform: rotate(360deg);
        }
      }
    `}</style>
    </div>
  )
}
