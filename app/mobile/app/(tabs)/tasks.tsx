import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Sparkles, Pencil, Trash2, X } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppStore } from "@/lib/store";
import { DAY_KEYS, DAY_LABELS, getLevelName } from "@/lib/utils";
import type { Habit, DayKey } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

export default function TasksPage() {
  const router = useRouter();
  const { state, hydrated, deleteHabit } = useAppStore();
  const { colors } = useTheme();
  const [selectedDays, setSelectedDays] = useState<DayKey[]>(() => [...DAY_KEYS]);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const tasks = useMemo(() => state.habits, [state.habits]);

  const filteredTasks = useMemo(() => {
    if (selectedDays.length === 0) return [];
    return tasks.filter((habit) => habit.days.some((day) => selectedDays.includes(day)));
  }, [tasks, selectedDays]);

  const toggleDay = (day: DayKey) => {
    setSelectedDays((days) =>
      days.includes(day) ? days.filter((d) => d !== day) : [...days, day]
    );
  };

  const toggleAll = () => {
    setSelectedDays((days) =>
      days.length === DAY_KEYS.length ? [] : [...DAY_KEYS]
    );
  };

  if (!hydrated) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBase }}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(600)} style={styles.headerSection}>
          <Text style={[styles.subtitle, { color: colors.fgTertiary }]}>Tasks</Text>
          <Text style={[styles.title, { color: colors.fgPrimary }]}>All rituals</Text>
        </Animated.View>

        {/* Day filter */}
        <Animated.View
          entering={FadeIn.duration(600)}
          style={[styles.filterCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
        >
          <View style={styles.filterRow}>
            {DAY_KEYS.map((day) => {
              const active = selectedDays.includes(day);
              return (
                <Pressable key={day} onPress={() => toggleDay(day)}>
                  {active ? (
                    <LinearGradient
                      colors={[colors.accent, colors.sage]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.filterChip}
                    >
                      <Text style={styles.filterChipTextActive}>{DAY_LABELS[day]}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.filterChip, { backgroundColor: colors.bgSubtle }]}>
                      <Text style={[styles.filterChipText, { color: colors.fgSecondary }]}>
                        {DAY_LABELS[day]}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
          <Pressable onPress={toggleAll}>
            <Text style={[styles.toggleAllText, { color: colors.accent }]}>
              {selectedDays.length === DAY_KEYS.length ? "Clear all" : "Every day"}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Tasks list */}
        {tasks.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
            <Text style={[styles.emptyText, { color: colors.fgSecondary }]}>
              You haven't added any rituals yet. Create one to see stability score,
              level, creation date, and completion count here.
            </Text>
          </View>
        ) : selectedDays.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
            <Text style={[styles.emptyText, { color: colors.fgSecondary }]}>
              Select one or more days above to display matching tasks.
            </Text>
          </View>
        ) : filteredTasks.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
            <Text style={[styles.emptyText, { color: colors.fgSecondary }]}>
              No rituals are scheduled for the selected day(s).
            </Text>
          </View>
        ) : (
          filteredTasks.map((habit, index) => (
            <TaskCard
              key={habit.id}
              habit={habit}
              delay={index * 50}
              colors={colors}
              onEdit={() => router.push(`/edit/${habit.id}`)}
              onDelete={() => setDeleteTarget({ id: habit.id, name: habit.name })}
            />
          ))
        )}
      </ScrollView>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={FadeIn.duration(300)}
            style={[styles.modalCard, { backgroundColor: colors.bgElevated, borderColor: colors.borderSubtle }]}
          >
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: "#dc2626" }]}>Delete ritual?</Text>
                <Text style={[styles.modalDesc, { color: colors.fgSecondary }]}>
                  Do you want to keep existing logs for{" "}
                  <Text style={{ fontWeight: "600" }}>{deleteTarget.name}</Text>?
                  Keeping logs preserves history while removing the habit.
                </Text>
              </View>
              <Pressable onPress={() => setDeleteTarget(null)} style={styles.modalClose}>
                <X size={16} color={colors.fgTertiary} />
              </Pressable>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => {
                  deleteHabit(deleteTarget.id, true);
                  setDeleteTarget(null);
                }}
                style={[styles.modalButton, { backgroundColor: colors.sage }]}
              >
                <Text style={styles.modalButtonText}>Keep logs and delete</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  deleteHabit(deleteTarget.id, false);
                  setDeleteTarget(null);
                }}
                style={[styles.modalButton, { borderWidth: 1, borderColor: "#fca5a5" }]}
              >
                <Text style={[styles.modalButtonTextDanger]}>Delete ritual and logs</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

function TaskCard({
  habit,
  delay,
  colors,
  onEdit,
  onDelete,
}: {
  habit: Habit;
  delay: number;
  colors: any;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const createdAt = new Date(habit.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const levelName = getLevelName(habit.level);

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(500)}
      style={[styles.taskCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
    >
      <View style={styles.taskHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.taskName, { color: colors.fgPrimary }]}>{habit.name}</Text>
          <Text style={[styles.taskLevel, { color: colors.fgTertiary }]}>
            Level {habit.level} · {levelName}
          </Text>
        </View>
        <View style={styles.taskActions}>
          <Pressable
            onPress={onEdit}
            style={[styles.actionButton, { backgroundColor: colors.accentBg }]}
          >
            <Pencil size={14} color={colors.accent} />
            <Text style={[styles.actionText, { color: colors.accent }]}>Edit</Text>
          </Pressable>
          <Pressable
            onPress={onDelete}
            style={[styles.actionButton, { borderWidth: 1, borderColor: colors.fgQuaternary }]}
          >
            <Trash2 size={14} color={colors.fgPrimary} />
            <Text style={[styles.actionText, { color: colors.fgPrimary }]}>Delete</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.stabilityBadge, { backgroundColor: colors.bgTint }]}>
        <Sparkles size={16} color={colors.accent} strokeWidth={1.6} />
        <Text style={[styles.stabilityText, { color: colors.accent }]}>
          {Math.round(habit.stabilityScore)} stability
        </Text>
      </View>

      <View style={styles.taskMeta}>
        <View style={styles.metaItem}>
          <Text style={[styles.metaLabel, { color: colors.fgTertiary }]}>Created</Text>
          <Text style={[styles.metaValue, { color: colors.fgSecondary }]}>{createdAt}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={[styles.metaLabel, { color: colors.fgTertiary }]}>Completed</Text>
          <Text style={[styles.metaValue, { color: colors.fgSecondary }]}>{habit.completionCount}</Text>
        </View>
      </View>

      <Text style={[styles.taskDays, { color: colors.fgSecondary }]}>
        {habit.days.length === 7
          ? "Every day"
          : [...habit.days]
              .sort((a, b) => DAY_KEYS.indexOf(a) - DAY_KEYS.indexOf(b))
              .map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3))
              .join(" · ")}
      </Text>
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
  headerSection: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 8,
    fontFamily: "Manrope",
  },
  title: {
    fontFamily: "Fraunces",
    fontSize: 32,
    letterSpacing: -0.5,
  },
  filterCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 44,
    alignItems: "center",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "Manrope",
  },
  filterChipTextActive: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "Manrope",
    color: "#fff",
  },
  toggleAllText: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "right",
    fontFamily: "Manrope",
  },
  emptyCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "Manrope",
  },
  taskCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    marginBottom: 16,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  taskName: {
    fontSize: 15,
    fontFamily: "Fraunces",
    letterSpacing: -0.3,
  },
  taskLevel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 2.5,
    marginTop: 12,
    fontFamily: "Manrope",
  },
  taskActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "Manrope",
  },
  stabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginTop: 16,
  },
  stabilityText: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "Manrope",
  },
  taskMeta: {
    flexDirection: "row",
    gap: 32,
    marginTop: 24,
  },
  metaItem: {
    gap: 4,
  },
  metaLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontFamily: "Manrope",
  },
  metaValue: {
    fontSize: 14,
    fontFamily: "Manrope",
  },
  taskDays: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 24,
    fontFamily: "Manrope",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(17,24,39,0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    zIndex: 100,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: "row",
    gap: 16,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Manrope",
  },
  modalDesc: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    fontFamily: "Manrope",
  },
  modalClose: {
    padding: 8,
  },
  modalActions: {
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Manrope",
  },
  modalButtonTextDanger: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Manrope",
  },
});
