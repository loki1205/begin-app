import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { ChevronDown, Sparkles } from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { formatDate, getDayKey, cn } from "@/lib/utils";
import { HabitRow } from "@/components/HabitRow";
import { useTheme } from "@/components/ThemeProvider";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";

export default function TodayPage() {
  const router = useRouter();
  const { state, setHabitStatus, deleteHabit, hydrated } = useAppStore();
  const { colors } = useTheme();
  const [completedOpen, setCompletedOpen] = useState(false);
  const [skippedOpen, setSkippedOpen] = useState(false);
  const [now] = useState(() => new Date());

  const today = formatDate(now);
  const todayKey = getDayKey(now.getDay());

  const { todaysHabits, completed, skipped, pending } = useMemo(() => {
    const todaysHabits = state.habits.filter((h) => h.days.includes(todayKey));
    const logsToday = state.logs.filter((l) => l.date === today);

    const getStatus = (id: string) =>
      logsToday.find((l) => l.habitId === id)?.status ?? "pending";

    return {
      todaysHabits,
      completed: todaysHabits.filter((h) => getStatus(h.id) === "completed"),
      skipped: todaysHabits.filter((h) => getStatus(h.id) === "skipped"),
      pending: todaysHabits.filter((h) => getStatus(h.id) === "pending"),
    };
  }, [state.habits, state.logs, today, todayKey]);

  const total = todaysHabits.length;
  const completedCount = completed.length;
  const progress = total > 0 ? completedCount / total : 0;

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const greeting = (() => {
    const h = now.getHours();
    if (h < 5) return "Late night";
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Tonight";
  })();

  if (!hydrated) return null;

  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: colors.bgBase }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, { color: colors.fgTertiary }]}>
            {greeting}
            {state.userName ? `, ${state.userName}` : ""}
          </Text>
          <Text style={[styles.dateTitle, { color: colors.fgPrimary }]}>
            {dateStr}
          </Text>
          <Text style={[styles.timeText, { color: colors.fgSecondary }]}>
            {timeStr}
          </Text>
        </View>

        {/* Progress ring */}
        {total > 0 && (
          <View style={styles.progressRing}>
            <Svg width={64} height={64} viewBox="0 0 100 100" style={{ transform: [{ rotate: "-90deg" }] }}>
              <Circle
                cx={50}
                cy={50}
                r={42}
                fill="none"
                stroke={colors.borderSubtle}
                strokeWidth={6}
              />
              <Circle
                cx={50}
                cy={50}
                r={42}
                fill="none"
                stroke={colors.accent}
                strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </Svg>
            <View style={styles.progressText}>
              <Text style={[styles.progressCount, { color: colors.fgPrimary }]}>
                {completedCount}
              </Text>
              <Text style={[styles.progressTotal, { color: colors.fgTertiary }]}>
                of {total}
              </Text>
            </View>
          </View>
        )}
      </Animated.View>

      {/* Pending habits */}
      {pending.length > 0 && (
        <View style={styles.section}>
          {pending.map((habit, index) => (
            <Animated.View
              key={habit.id}
              entering={FadeInDown.delay(200 + index * 60).duration(500)}
            >
              <HabitRow
                habit={habit}
                status="pending"
                onStatusChange={(s) => setHabitStatus(habit.id, today, s)}
                onDelete={() => deleteHabit(habit.id)}
              />
            </Animated.View>
          ))}
        </View>
      )}

      {/* Completed section */}
      {completed.length > 0 && (
        <View style={styles.section}>
          <Pressable
            onPress={() => setCompletedOpen(!completedOpen)}
            style={styles.sectionHeader}
          >
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionDot, { backgroundColor: colors.sage }]} />
              <Text style={[styles.sectionTitle, { color: colors.fgTertiary }]}>
                Completed · {completed.length}
              </Text>
            </View>
            <ChevronDown
              size={16}
              color={colors.fgTertiary}
              style={{ transform: [{ rotate: completedOpen ? "180deg" : "0deg" }] }}
            />
          </Pressable>
          {completedOpen && (
            <View style={{ marginTop: 8 }}>
              {completed.map((habit) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  status="completed"
                  onStatusChange={(s) => setHabitStatus(habit.id, today, s)}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Skipped section */}
      {skipped.length > 0 && (
        <View style={styles.section}>
          <Pressable
            onPress={() => setSkippedOpen(!skippedOpen)}
            style={styles.sectionHeader}
          >
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionDot, { backgroundColor: colors.fgQuaternary }]} />
              <Text style={[styles.sectionTitle, { color: colors.fgTertiary }]}>
                Skipped · {skipped.length}
              </Text>
            </View>
            <ChevronDown
              size={16}
              color={colors.fgTertiary}
              style={{ transform: [{ rotate: skippedOpen ? "180deg" : "0deg" }] }}
            />
          </Pressable>
          {skippedOpen && (
            <View style={{ marginTop: 8 }}>
              {skipped.map((habit) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  status="skipped"
                  onStatusChange={(s) => setHabitStatus(habit.id, today, s)}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Empty state */}
      {total === 0 && (
        <Animated.View
          entering={FadeIn.delay(200).duration(800)}
          style={styles.emptyState}
        >
          <EmptySparkle color={colors.fgTertiary} />
          <Text style={[styles.emptyTitle, { color: colors.fgPrimary }]}>
            No habits for today.
          </Text>
          <Text style={[styles.emptyDesc, { color: colors.fgSecondary }]}>
            A blank page is its own kind of beginning.
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/add")}
            style={[styles.emptyButton, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
          >
            <Text style={[styles.emptyButtonText, { color: colors.fgPrimary }]}>
              Add your first ritual
            </Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Hint */}
      {pending.length > 0 && completedCount === 0 && (
        <Animated.View entering={FadeIn.delay(1000).duration(600)} style={styles.hint}>
          <Text style={[styles.hintText, { color: colors.fgTertiary }]}>
            Tap the circle to complete · Swipe right to skip
          </Text>
        </Animated.View>
      )}
    </ScrollView>
  );
}

function EmptySparkle({ color }: { color: string }) {
  const scale = useSharedValue(1);
  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  return (
    <Animated.View style={[{ marginBottom: 24 }, style]}>
      <Sparkles size={32} color={color} strokeWidth={1.2} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 40,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 8,
    fontFamily: "Manrope",
  },
  dateTitle: {
    fontFamily: "Fraunces",
    fontSize: 28,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  timeText: {
    fontSize: 13,
    marginTop: 8,
    fontFamily: "Manrope",
    fontVariant: ["tabular-nums"],
  },
  progressRing: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    position: "absolute",
    alignItems: "center",
  },
  progressCount: {
    fontFamily: "Fraunces",
    fontSize: 18,
  },
  progressTotal: {
    fontSize: 10,
    marginTop: -2,
    fontFamily: "Manrope",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontFamily: "Manrope",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontFamily: "Fraunces",
    fontSize: 24,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: "center",
    maxWidth: 280,
    marginBottom: 32,
    fontFamily: "Manrope",
    lineHeight: 20,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Manrope",
  },
  hint: {
    alignItems: "center",
    marginTop: 32,
  },
  hintText: {
    fontSize: 12,
    fontStyle: "italic",
    fontFamily: "Manrope",
  },
});
