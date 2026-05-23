import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { ArrowRight } from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { useTheme } from "@/components/ThemeProvider";

export default function OnboardingPage() {
  const router = useRouter();
  const { setUserName } = useAppStore();
  const { colors } = useTheme();
  const [step, setStep] = useState<"welcome" | "name">("welcome");
  const [name, setName] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const t = setTimeout(() => setStep("name"), 2200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (step === "name") {
      setTimeout(() => inputRef.current?.focus(), 600);
    }
  }, [step]);

  const handleContinue = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setUserName(trimmed);
    router.replace("/(tabs)/today");
  };

  // Floating decorative shapes
  const float1Y = useSharedValue(0);
  const float2Y = useSharedValue(0);

  useEffect(() => {
    float1Y.value = withRepeat(
      withSequence(
        withTiming(-30, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 6000, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
    float2Y.value = withDelay(
      2000,
      withRepeat(
        withSequence(
          withTiming(30, { duration: 7000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 7000, easing: Easing.inOut(Easing.ease) })
        ),
        -1
      )
    );
  }, []);

  const float1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: float1Y.value }],
  }));
  const float2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: float2Y.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.bgBase }]}>
      {/* Floating decorative shapes */}
      <Animated.View
        style={[
          styles.floatShape1,
          float1Style,
          { backgroundColor: colors.accent + "26" },
        ]}
      />
      <Animated.View
        style={[
          styles.floatShape2,
          float2Style,
          { backgroundColor: colors.sage + "26" },
        ]}
      />

      {step === "welcome" && (
        <Animated.View
          entering={FadeIn.duration(800)}
          exiting={FadeOut.duration(600)}
          style={styles.welcomeContainer}
        >
          <Text style={[styles.welcomeSmall, { color: colors.fgPrimary, opacity: 0.4 }]}>
            small
          </Text>
          <Text style={[styles.welcomeLarge, { color: colors.fgPrimary }]}>
            rituals
          </Text>
          <Text style={[styles.welcomeItalic, { color: colors.accent }]}>
            shape us.
          </Text>

          <Animated.View entering={FadeIn.delay(600).duration(800)}>
            <Text style={[styles.welcomeDesc, { color: colors.fgSecondary }]}>
              A quiet place to return to. Track the small things that make you who
              you're becoming.
            </Text>
          </Animated.View>
        </Animated.View>
      )}

      {step === "name" && (
        <Animated.View
          entering={SlideInDown.duration(800).easing(Easing.out(Easing.cubic))}
          style={styles.nameContainer}
        >
          <Text style={[styles.oneMoment, { color: colors.fgTertiary }]}>
            one moment
          </Text>

          <Text style={[styles.nameTitle, { color: colors.fgPrimary }]}>
            What do we call you?
          </Text>

          <TextInput
            ref={inputRef}
            value={name}
            onChangeText={setName}
            onSubmitEditing={handleContinue}
            placeholder="your name"
            placeholderTextColor={colors.fgQuaternary}
            maxLength={32}
            style={[
              styles.nameInput,
              {
                color: colors.fgPrimary,
                borderBottomColor: name ? colors.accent : colors.borderStrong,
              },
            ]}
          />

          <Pressable
            onPress={handleContinue}
            disabled={!name.trim()}
            style={[
              styles.continueButton,
              {
                backgroundColor: colors.glassBg,
                borderColor: colors.glassBorder,
                opacity: name.trim() ? 1 : 0.3,
              },
            ]}
          >
            <Text style={[styles.continueText, { color: colors.fgPrimary }]}>
              Continue
            </Text>
            <ArrowRight size={16} color={colors.fgPrimary} />
          </Pressable>

          <Text style={[styles.privacyNote, { color: colors.fgTertiary }]}>
            Your data stays on this device. Always.
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  floatShape1: {
    position: "absolute",
    top: "15%",
    left: "10%",
    width: 100,
    height: 100,
    borderRadius: 40,
    opacity: 0.5,
  },
  floatShape2: {
    position: "absolute",
    bottom: "20%",
    right: "15%",
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.5,
  },
  welcomeContainer: {
    alignItems: "center",
    maxWidth: 320,
  },
  welcomeSmall: {
    fontFamily: "Fraunces",
    fontSize: 48,
    letterSpacing: -1,
    lineHeight: 52,
  },
  welcomeLarge: {
    fontFamily: "Fraunces",
    fontSize: 56,
    letterSpacing: -1,
    lineHeight: 60,
  },
  welcomeItalic: {
    fontFamily: "Fraunces_Italic",
    fontSize: 56,
    letterSpacing: -1,
    lineHeight: 60,
  },
  welcomeDesc: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 24,
    fontFamily: "Manrope",
  },
  nameContainer: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
  },
  oneMoment: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 3,
    marginBottom: 24,
    fontFamily: "Manrope",
  },
  nameTitle: {
    fontFamily: "Fraunces",
    fontSize: 36,
    letterSpacing: -0.5,
    textAlign: "center",
    marginBottom: 48,
  },
  nameInput: {
    width: "100%",
    textAlign: "center",
    fontSize: 28,
    fontFamily: "Fraunces",
    borderBottomWidth: 1,
    paddingVertical: 16,
    marginBottom: 48,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  continueText: {
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "Manrope",
  },
  privacyNote: {
    fontSize: 12,
    marginTop: 48,
    fontFamily: "Manrope",
  },
});
