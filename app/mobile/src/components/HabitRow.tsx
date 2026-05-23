import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  interpolateColor,
} from "react-native-reanimated";
import { Flame, SkipForward, Trash2 } from "lucide-react-native";
import { useTheme } from "@/components/ThemeProvider";
import type { Habit, HabitStatus } from "@/lib/utils";

interface HabitRowProps {
  habit: Habit;
  status: HabitStatus;
  onStatusChange: (status: HabitStatus) => void;
  onDelete?: () => void;
}

export function HabitRow({ habit, status, onStatusChange, onDelete }: HabitRowProps) {
  const { colors } = useTheme();
  const translateX = useSharedValue(0);
  const [showDelete, setShowDelete] = useState(false);

  const isCompleted = status === "completed";
  const isSkipped = status === "skipped";

  const handleCheckbox = () => {
    if (status === "completed") {
      onStatusChange("pending");
    } else {
      onStatusChange("completed");
    }
  };

  const handleSwipeEnd = () => {
    if (translateX.value > 80) {
      if (isSkipped) {
        onStatusChange("pending");
      } else {
        onStatusChange("skipped");
      }
    }
    translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = Math.max(-80, Math.min(200, event.translationX));
    })
    .onEnd(() => {
      runOnJS(handleSwipeEnd)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const skipHintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, 60, 120], [0, 0.4, 1]),
  }));

  const checkScale = useSharedValue(isCompleted ? 1 : 0);

  React.useEffect(() => {
    checkScale.value = withSpring(isCompleted ? 1 : 0, {
      stiffness: 500,
      damping: 25,
    });
  }, [isCompleted]);

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Skip hint background */}
      <Animated.View style={[styles.skipHint, skipHintStyle]}>
        <SkipForward size={16} color={colors.fgTertiary} />
        <Text style={[styles.skipText, { color: colors.fgTertiary }]}>
          {isSkipped ? "Bring it back" : "Skip today"}
        </Text>
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.row,
            animatedStyle,
            {
              backgroundColor: colors.glassBg,
              borderColor: colors.glassBorder,
              opacity: isSkipped ? 0.5 : isCompleted ? 0.9 : 1,
            },
          ]}
        >
          {/* Checkbox */}
          <Pressable
            onPress={handleCheckbox}
            style={styles.checkboxTouchArea}
            accessibilityLabel={isCompleted ? "Mark incomplete" : "Mark complete"}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: isCompleted ? colors.sage : colors.borderStrong,
                  backgroundColor: isCompleted ? colors.sage : "transparent",
                },
              ]}
            >
              {isCompleted && (
                <Animated.View style={checkAnimatedStyle}>
                  <CheckIcon />
                </Animated.View>
              )}
            </View>
          </Pressable>

          {/* Habit name */}
          <View style={styles.content}>
            <Text
              style={[
                styles.habitName,
                { color: colors.fgPrimary },
                isCompleted && {
                  textDecorationLine: "line-through",
                  textDecorationColor: colors.fgTertiary,
                },
              ]}
            >
              {habit.name}
            </Text>
            {habit.days.length < 7 && (
              <Text style={[styles.daysText, { color: colors.fgTertiary }]}>
                {habit.days
                  .map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3))
                  .join(" · ")}
              </Text>
            )}
          </View>

          {/* Stability score */}
          {habit.stabilityScore > 0 && (
            <View style={styles.scoreContainer}>
              <Flame size={14} color={colors.accent} />
              <Text style={[styles.scoreText, { color: colors.fgSecondary }]}>
                {Math.round(habit.stabilityScore)}
              </Text>
            </View>
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function CheckIcon() {
  return (
    <View style={{ width: 16, height: 16, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>✓</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginBottom: 12,
  },
  skipHint: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 24,
    gap: 8,
  },
  skipText: {
    fontSize: 13,
    fontFamily: "Manrope",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  checkboxTouchArea: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  habitName: {
    fontSize: 15,
    fontFamily: "Manrope",
    letterSpacing: -0.3,
  },
  daysText: {
    fontSize: 11,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontFamily: "Manrope",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "Manrope",
  },
});
