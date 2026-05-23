import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppStore } from "@/lib/store";
import { DAY_KEYS, DAY_LABELS, getLevelName } from "@/lib/utils";
import type { DayKey } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

export default function EditHabitPage() {
  const router = useRouter();
  const { id: habitId } = useLocalSearchParams<{ id: string }>();
  const { state, hydrated, updateHabit } = useAppStore();
  const { colors } = useTheme();

  const habit = state.habits.find((h) => h.id === habitId);
  const [name, setName] = useState("");
  const [days, setDays] = useState<DayKey[]>([]);

  useEffect(() => {
    if (!habit) return;
    setName(habit.name);
    setDays(habit.days);
  }, [habit]);

  const toggleDay = (day: DayKey) => {
    setDays((d) => (d.includes(day) ? d.filter((x) => x !== day) : [...d, day]));
  };

  const toggleAll = () => {
    if (days.length === 7) setDays([]);
    else setDays([...DAY_KEYS]);
  };

  const canSubmit = name.trim().length > 0 && days.length > 0;

  const handleSubmit = () => {
    if (!habit || !canSubmit) return;
    updateHabit({
      ...habit,
      name: name.trim(),
      days,
    });
    router.push("/(tabs)/tasks");
  };

  if (!hydrated) return null;

  if (!habitId || !habit) {
    return (
      <View style={[styles.notFoundContainer, { backgroundColor: colors.bgBase }]}>
        <View style={[styles.notFoundCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
          <Text style={[styles.notFoundTitle, { color: colors.fgPrimary }]}>Ritual not found.</Text>
          <Text style={[styles.notFoundDesc, { color: colors.fgSecondary }]}>
            The ritual you are trying to edit does not exist or was removed.
          </Text>
          <Pressable onPress={() => router.push("/(tabs)/tasks")}>
            <LinearGradient
              colors={[colors.accent, colors.sage]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.notFoundButton}
            >
              <Text style={styles.notFoundButtonText}>Back to tasks</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    );
  }

  const level = habit.level;
  const levelName = getLevelName(level);

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: colors.bgBase }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View entering={FadeIn.duration(600)} style={styles.headerSection}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.push("/(tabs)/tasks")}
            style={[styles.backBtn, { backgroundColor: colors.bgTint }]}
          >
            <ArrowLeft size={16} color={colors.accent} />
          </Pressable>
          <Text style={[styles.headerLabel, { color: colors.fgTertiary }]}>Edit ritual</Text>
        </View>
        <Text style={[styles.title, { color: colors.fgPrimary }]}>Update your ritual.</Text>
        <Text style={[styles.desc, { color: colors.fgSecondary }]}>
          Make small adjustments to keep your routine aligned with how you actually show up.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.form}>
        {/* Habit name */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.fgTertiary }]}>What ritual?</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Read for ten minutes"
            placeholderTextColor={colors.fgQuaternary}
            maxLength={64}
            autoFocus
            style={[
              styles.input,
              {
                color: colors.fgPrimary,
                borderBottomColor: name ? colors.accent : colors.borderStrong,
              },
            ]}
          />
        </View>

        {/* Day selector */}
        <View style={styles.field}>
          <View style={styles.dayHeader}>
            <Text style={[styles.label, { color: colors.fgTertiary }]}>On which days?</Text>
            <Pressable onPress={toggleAll}>
              <Text style={[styles.toggleAll, { color: colors.accent }]}>
                {days.length === 7 ? "Clear all" : "Every day"}
              </Text>
            </Pressable>
          </View>
          <View style={styles.daysRow}>
            {DAY_KEYS.map((d) => {
              const active = days.includes(d);
              return (
                <Pressable
                  key={d}
                  onPress={() => toggleDay(d)}
                  style={[styles.dayButton, { flex: 1 }]}
                >
                  {active ? (
                    <LinearGradient
                      colors={[colors.accent, colors.sage]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.dayButtonActive}
                    >
                      <Text style={styles.dayTextActive}>{DAY_LABELS[d]}</Text>
                    </LinearGradient>
                  ) : (
                    <View
                      style={[
                        styles.dayButtonInactive,
                        { backgroundColor: colors.bgSubtle, borderColor: colors.borderSubtle },
                      ]}
                    >
                      <Text style={[styles.dayTextInactive, { color: colors.fgSecondary }]}>
                        {DAY_LABELS[d]}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Level preview */}
        <View style={[styles.levelCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
          <View style={[styles.levelIcon, { backgroundColor: colors.accentBg }]}>
            <Sparkles size={20} color={colors.accent} strokeWidth={1.6} />
          </View>
          <View style={styles.levelContent}>
            <Text style={[styles.levelLabel, { color: colors.fgTertiary }]}>Current level</Text>
            <Text style={[styles.levelValue, { color: colors.fgPrimary }]}>
              Level {level} — {levelName}
            </Text>
          </View>
          <Text style={[styles.levelHint, { color: colors.fgTertiary }]}>updated after save</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsRow}>
          <Pressable onPress={handleSubmit} disabled={!canSubmit} style={{ flex: 1 }}>
            {canSubmit ? (
              <LinearGradient
                colors={[colors.accent, colors.sage]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitButton}
              >
                <Text style={styles.submitText}>Save changes</Text>
                <ArrowRight size={16} color="#fff" />
              </LinearGradient>
            ) : (
              <View style={[styles.submitButtonDisabled, { backgroundColor: colors.bgSubtle }]}>
                <Text style={[styles.submitTextDisabled, { color: colors.fgTertiary }]}>Save changes</Text>
                <ArrowRight size={16} color={colors.fgTertiary} />
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.push("/(tabs)/tasks")}
            style={[styles.cancelButton, { borderColor: colors.borderStrong }]}
          >
            <Text style={[styles.cancelText, { color: colors.fgSecondary }]}>Cancel</Text>
          </Pressable>
        </View>
      </Animated.View>
    </ScrollView>
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
  headerSection: {
    marginBottom: 48,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontFamily: "Manrope",
  },
  title: {
    fontFamily: "Fraunces",
    fontSize: 32,
    letterSpacing: -0.5,
  },
  desc: {
    fontSize: 14,
    marginTop: 12,
    fontFamily: "Manrope",
    lineHeight: 20,
  },
  form: {
    gap: 32,
  },
  field: {
    gap: 12,
  },
  label: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 2.5,
    fontFamily: "Manrope",
  },
  input: {
    fontSize: 24,
    fontFamily: "Fraunces",
    borderBottomWidth: 1,
    paddingVertical: 12,
    letterSpacing: -0.3,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleAll: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: "Manrope",
  },
  daysRow: {
    flexDirection: "row",
    gap: 8,
  },
  dayButton: {
    height: 48,
    borderRadius: 16,
    overflow: "hidden",
  },
  dayButtonActive: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  dayButtonInactive: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
  },
  dayTextActive: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "Manrope",
  },
  dayTextInactive: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "Manrope",
  },
  levelCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  levelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  levelContent: {
    flex: 1,
  },
  levelLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontFamily: "Manrope",
  },
  levelValue: {
    fontFamily: "Fraunces",
    fontSize: 18,
    letterSpacing: -0.3,
    marginTop: 4,
  },
  levelHint: {
    fontSize: 12,
    fontStyle: "italic",
    fontFamily: "Manrope",
  },
  buttonsRow: {
    gap: 12,
    marginTop: 16,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 999,
  },
  submitText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "Manrope",
  },
  submitButtonDisabled: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 999,
  },
  submitTextDisabled: {
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "Manrope",
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 999,
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Manrope",
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  notFoundCard: {
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Manrope",
    marginBottom: 12,
  },
  notFoundDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "Manrope",
    marginBottom: 32,
  },
  notFoundButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  notFoundButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Manrope",
  },
});
