"use client"

import { useEffect, useState } from "react"
import SplashScreen from "../components/splashScreen"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate app loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <SplashScreen />
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">Vibe Melody</h1>
        <p className="text-muted-foreground">Your music, your way</p>
      </div>
    </main>
  )
}
