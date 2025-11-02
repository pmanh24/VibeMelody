"use client"

import { useEffect, useRef } from "react"
import { View, Text, StyleSheet, Animated, Easing } from "react-native"

export default function SplashScreen() {
  // Animation refs
  const spinValue = useRef(new Animated.Value(0)).current
  const spinValue2 = useRef(new Animated.Value(0)).current
  const opacity1 = useRef(new Animated.Value(0.4)).current
  const opacity2 = useRef(new Animated.Value(0.4)).current
  const opacity3 = useRef(new Animated.Value(0.4)).current
  const progressAnim = useRef(new Animated.Value(0)).current

  // Start animations
  useEffect(() => {
    // Spin rings
    Animated.loop(Animated.timing(spinValue, { toValue: 1, duration: 3000, useNativeDriver: true })).start()
    Animated.loop(Animated.timing(spinValue2, { toValue: 1, duration: 4000, useNativeDriver: true })).start()

    // Pulse dots
    const pulse = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.4, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start()
    }
    pulse(opacity1, 0)
    pulse(opacity2, 200)
    pulse(opacity3, 400)

    // Progress bar
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 3000,
      useNativeDriver: false,
    }).start()
  }, [])

  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] })
  const spinReverse = spinValue2.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-360deg"] })
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] })

  return (
    <View style={styles.container}>
      <View style={styles.gradientBg} />
      <View style={[styles.blur, styles.blurTop]} />
      <View style={[styles.blur, styles.blurBottom]} />

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logo}>
          <View style={styles.glass} />
          <View style={styles.rings}>
            <Animated.View style={[styles.ring1, { transform: [{ rotate: spin }] }]} />
            <Animated.View style={[styles.ring2, { transform: [{ rotate: spinReverse }] }]} />
            <View style={styles.inner} />
            <View style={styles.center} />
          </View>
        </View>

        {/* Text */}
        <Text style={styles.title}>Vibe Melody</Text>
        <Text style={styles.subtitle}>Ultimate media experience</Text>

        {/* Loading */}
        <View style={styles.loading}>
          <View style={styles.dots}>
            <Animated.View style={[styles.dot, { opacity: opacity1 }]} />
            <Animated.View style={[styles.dot, { opacity: opacity2 }]} />
            <Animated.View style={[styles.dot, { opacity: opacity3 }]} />
          </View>

          <View style={styles.barBg}>
            <Animated.View style={[styles.bar, { width: progressWidth }]} />
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  gradientBg: { ...StyleSheet.absoluteFillObject, backgroundColor: "#0f172a" },
  blur: { position: "absolute", borderRadius: 9999, opacity: 0.3 },
  blurTop: { width: 400, height: 400, top: -200, right: -200, backgroundColor: "#1e40af" },
  blurBottom: { width: 320, height: 320, bottom: -160, left: -160, backgroundColor: "#1e293b" },
  content: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  logo: { width: 160, height: 160, marginBottom: 48, position: "relative" },
  glass: { ...StyleSheet.absoluteFillObject, borderRadius: 80, borderWidth: 2, borderColor: "rgba(255,255,255,0.3)", backgroundColor: "rgba(255,255,255,0.05)" },
  rings: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center" },
  ring1: { width: 160, height: 160, borderRadius: 80, borderWidth: 4, borderTopColor: "#93c5fd", borderRightColor: "#60a5fa", borderBottomColor: "transparent", borderLeftColor: "transparent" },
  ring2: { width: 128, height: 128, borderRadius: 64, borderWidth: 3, borderBottomColor: "#60a5fa", borderLeftColor: "#93c5fd", borderTopColor: "transparent", borderRightColor: "transparent" },
  inner: { width: 96, height: 96, borderRadius: 48, backgroundColor: "#3b82f6", opacity: 0.8, position: "absolute" },
  center: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#0f172a", position: "absolute" },
  title: { fontSize: 48, fontWeight: "bold", color: "#fff", fontFamily: "DancingScript_700Bold", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#cbd5e1", fontFamily: "Geist", marginBottom: 48 },
  loading: { width: "100%", alignItems: "center" },
  dots: { flexDirection: "row", gap: 8, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#60a5fa" },
  barBg: { height: 4, width: "100%", backgroundColor: "#334155", borderRadius: 2, overflow: "hidden" },
  bar: { height: "100%", backgroundColor: "#60a5fa", borderRadius: 2 },
})