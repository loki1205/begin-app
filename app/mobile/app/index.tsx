import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useAppStore } from "@/lib/store";
import { getDailyQuote } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import Svg, { Circle } from "react-native-svg";

export default function SplashPage() {
  const router = useRouter();
  const { state, hydrated } = useAppStore();
  const { colors } = useTheme();
  const [quote] = useState(() => getDailyQuote());
  const [exiting, setExiting] = useState(false);

  // Breathing ring animations
  const ring1Scale = useSharedValue(1);
  const ring2Scale = useSharedValue(1);
  const ring3Scale = useSharedValue(1);

  useEffect(() => {
    ring1Scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
    ring2Scale.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(1.12, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1
      )
    );
    ring3Scale.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(1.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1
      )
    );
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      setExiting(true);
      setTimeout(() => {
        if (state.onboarded) router.replace("/(tabs)/today");
        else router.replace("/onboarding");
      }, 800);
    }, 2400);
    return () => clearTimeout(t);
  }, [hydrated, state.onboarded, router]);

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
  }));
  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
  }));
  const ring3Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring3Scale.value }],
  }));

  const opacity = useSharedValue(1);
  useEffect(() => {
    if (exiting) {
      opacity.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.ease) });
    }
  }, [exiting]);
  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.bgBase }, fadeStyle]}>
      {/* Logo composition */}
      <Animated.View entering={FadeIn.duration(1200)} style={styles.logoContainer}>
        {/* Concentric rings */}
        <Animated.View style={[styles.ring, styles.ring1, ring1Style, { borderColor: colors.accent + "33" }]} />
        <Animated.View style={[styles.ring, styles.ring2, ring2Style, { borderColor: colors.accent + "26" }]} />
        <Animated.View style={[styles.ring, styles.ring3, ring3Style, { borderColor: colors.accent + "1A" }]} />

        {/* Center mark */}
        <LinearGradient
          colors={[colors.accent, colors.sage]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.centerMark}
        >
          <Svg width={40} height={40} viewBox="0 0 24 24">
            <Circle cx={12} cy={12} r={3} fill="#fff" />
            <Circle cx={12} cy={12} r={7} stroke="#fff" strokeWidth={1.2} fill="none" opacity={0.5} />
            <Circle cx={12} cy={12} r={11} stroke="#fff" strokeWidth={0.8} fill="none" opacity={0.25} />
          </Svg>
        </LinearGradient>
      </Animated.View>

      {/* Title */}
      <Animated.View entering={FadeIn.delay(400).duration(800)}>
        <Text style={[styles.title, { color: colors.fgPrimary }]}>begin</Text>
      </Animated.View>

      {/* Quote */}
      <Animated.View entering={FadeIn.delay(700).duration(800)}>
        <Text style={[styles.quote, { color: colors.fgSecondary }]}>
          &ldquo;{quote}&rdquo;
        </Text>
      </Animated.View>

      {/* Loading dots */}
      <Animated.View entering={FadeIn.delay(1400).duration(800)} style={styles.dots}>
        <LoadingDots color={colors.fgTertiary} />
      </Animated.View>
    </Animated.View>
  );
}

function LoadingDots({ color }: { color: string }) {
  const dot1 = useSharedValue(0.2);
  const dot2 = useSharedValue(0.2);
  const dot3 = useSharedValue(0.2);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 750 }),
        withTiming(0.2, { duration: 750 })
      ),
      -1
    );
    dot2.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 750 }),
          withTiming(0.2, { duration: 750 })
        ),
        -1
      )
    );
    dot3.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 750 }),
          withTiming(0.2, { duration: 750 })
        ),
        -1
      )
    );
  }, []);

  const d1Style = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const d2Style = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const d3Style = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <View style={styles.dotsRow}>
      <Animated.View style={[styles.dot, { backgroundColor: color }, d1Style]} />
      <Animated.View style={[styles.dot, { backgroundColor: color }, d2Style]} />
      <Animated.View style={[styles.dot, { backgroundColor: color }, d3Style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    width: 200,
    height: 200,
  },
  ring: {
    position: "absolute",
    borderWidth: 1,
    borderRadius: 999,
  },
  ring1: {
    width: 120,
    height: 120,
  },
  ring2: {
    width: 160,
    height: 160,
  },
  ring3: {
    width: 200,
    height: 200,
  },
  centerMark: {
    width: 64,
    height: 64,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Fraunces",
    fontSize: 56,
    letterSpacing: -1,
    marginBottom: 12,
    textAlign: "center",
  },
  quote: {
    fontFamily: "Fraunces",
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 24,
  },
  dots: {
    position: "absolute",
    bottom: 48,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
