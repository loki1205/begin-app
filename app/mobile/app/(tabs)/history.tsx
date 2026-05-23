import React, { useState, useMemo, useEffect } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useAppStore } from "@/lib/store";
import { WheelPicker } from "@/components/WheelPicker";
import { formatDate } from "@/lib/utils";
import { Check, X, ChevronDown } from "lucide-react-native";
import { useTheme } from "@/components/ThemeProvider";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function HistoryPage() {
  const { state, hydrated } = useAppStore();
  const { colors } = useTheme();
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [day, setDay] = useState(today.getDate());
  const [isDatePickerExpanded, setIsDatePickerExpanded] = useState(false);

  const years = useMemo(() => {
    const arr = [];
    for (let y = today.getFullYear() - 5; y <= today.getFullYear(); y++) {
      arr.push({ value: y, label: String(y) });
    }
    return arr;
  }, []);

  const months = useMemo(() => {
    return MONTHS.map((label, value) => {
      const disabled = year === today.getFullYear() && value > today.getMonth();
      return { value, label, disabled };
    });
  }, [year]);

  const days = useMemo(() => {
    const dim = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: dim }, (_, i) => {
      const v = i + 1;
      const date = new Date(year, month, v);
      const disabled = date > today;
      return { value: v, label: String(v).padStart(2, "0"), disabled };
    });
  }, [year, month]);

  useEffect(() => {
    const dim = new Date(year, month + 1, 0).getDate();
    if (day > dim) setDay(dim);
    const selected = new Date(year, month, day);
    if (selected > today) {
      setDay(today.getDate());
      setMonth(today.getMonth());
      setYear(today.getFullYear());
    }
  }, [year, month, day]);

  const selectedDate = useMemo(() => new Date(year, month, day), [year, month, day]);
  const dateStr = useMemo(() => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }, [year, month, day]);

  const dayLogs = useMemo(() => {
    return state.logs.filter((l) => l.date === dateStr);
  }, [state.logs, dateStr]);

  const habitMap = useMemo(() => {
    return new Map(state.habits.map((h) => [h.id, h]));
  }, [state.habits]);

  const completedLogs = dayLogs.filter((l) => l.status === "completed");
  const skippedLogs = dayLogs.filter((l) => l.status === "skipped");

  if (!hydrated) return null;

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: colors.bgBase }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeIn.duration(600)} style={styles.headerSection}>
        <Text style={[styles.subtitle, { color: colors.fgTertiary }]}>Looking back</Text>
        <Text style={[styles.title, { color: colors.fgPrimary }]}>History</Text>
      </Animated.View>

      {/* Date picker */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(700)}
        style={[styles.dateCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
      >
        <Pressable
          onPress={() => setIsDatePickerExpanded(!isDatePickerExpanded)}
          style={styles.dateHeader}
        >
          <View>
            <Text style={[styles.dateLabel, { color: colors.fgTertiary }]}>Date</Text>
            <Text style={[styles.dateValue, { color: colors.fgPrimary }]}>
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
          <ChevronDown
            size={20}
            color={colors.fgSecondary}
            style={{
              transform: [{ rotate: isDatePickerExpanded ? "180deg" : "0deg" }],
            }}
          />
        </Pressable>

        {isDatePickerExpanded && (
          <View style={[styles.pickerSection, { borderTopColor: colors.borderSubtle }]}>
            <WheelPicker label="Year" items={years} value={year} onChange={setYear} itemWidth={120} visibleItems={3} />
            <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
            <WheelPicker label="Month" items={months} value={month} onChange={setMonth} itemWidth={120} visibleItems={3} />
            <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
            <WheelPicker label="Day" items={days} value={day} onChange={setDay} itemWidth={120} visibleItems={3} />
          </View>
        )}
      </Animated.View>

      {/* Results */}
      {dayLogs.length === 0 ? (
        <View style={styles.noResults}>
          <Text style={[styles.noResultsTitle, { color: colors.fgSecondary }]}>
            No tasks to show.
          </Text>
          <Text style={[styles.noResultsDesc, { color: colors.fgTertiary }]}>
            Nothing recorded on this day.
          </Text>
        </View>
      ) : (
        <View style={styles.results}>
          {completedLogs.length > 0 && (
            <View style={styles.resultSection}>
              <View style={styles.resultSectionHeader}>
                <View style={[styles.resultDot, { backgroundColor: colors.sage }]} />
                <Text style={[styles.resultSectionTitle, { color: colors.fgTertiary }]}>
                  Completed · {completedLogs.length}
                </Text>
              </View>
              {completedLogs.map((log) => {
                const habit = habitMap.get(log.habitId);
                const name = habit?.name ?? (log.habitName ? `${log.habitName} (removed)` : "Removed habit");
                return (
                  <View key={log.habitId} style={[styles.logRow, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
                    <View style={[styles.logIcon, { backgroundColor: colors.sage + "20" }]}>
                      <Check size={14} color={colors.sage} strokeWidth={2.5} />
                    </View>
                    <Text style={[styles.logName, { color: colors.fgPrimary }]}>{name}</Text>
                  </View>
                );
              })}
            </View>
          )}
          {skippedLogs.length > 0 && (
            <View style={styles.resultSection}>
              <View style={styles.resultSectionHeader}>
                <View style={[styles.resultDot, { backgroundColor: colors.fgQuaternary }]} />
                <Text style={[styles.resultSectionTitle, { color: colors.fgTertiary }]}>
                  Skipped · {skippedLogs.length}
                </Text>
              </View>
              {skippedLogs.map((log) => {
                const habit = habitMap.get(log.habitId);
                const name = habit?.name ?? (log.habitName ? `${log.habitName} (removed)` : "Removed habit");
                return (
                  <View key={log.habitId} style={[styles.logRow, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
                    <View style={[styles.logIcon, { backgroundColor: colors.fgQuaternary + "20" }]}>
                      <X size={14} color={colors.fgTertiary} strokeWidth={2.5} />
                    </View>
                    <Text style={[styles.logName, { color: colors.fgSecondary }]}>{name}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}
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
  dateCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    marginBottom: 32,
  },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 4,
    fontFamily: "Manrope",
  },
  dateValue: {
    fontFamily: "Fraunces",
    fontSize: 22,
    letterSpacing: -0.3,
  },
  pickerSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 4,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  noResults: {
    alignItems: "center",
    paddingVertical: 64,
  },
  noResultsTitle: {
    fontFamily: "Fraunces",
    fontSize: 22,
    marginBottom: 8,
  },
  noResultsDesc: {
    fontSize: 14,
    fontFamily: "Manrope",
  },
  results: {
    gap: 24,
  },
  resultSection: {
    gap: 12,
  },
  resultSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 8,
  },
  resultDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  resultSectionTitle: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontFamily: "Manrope",
  },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  logIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  logName: {
    fontSize: 15,
    fontFamily: "Manrope",
    letterSpacing: -0.3,
    flex: 1,
  },
});
