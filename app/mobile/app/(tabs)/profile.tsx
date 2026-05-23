import React, { useState, useRef, useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, Modal } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import {
  Sun,
  Moon,
  Monitor,
  HelpCircle,
  Share2,
  Sparkles,
  Edit,
  Check,
  Upload,
  Download,
  X,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useAppStore } from "@/lib/store";
import { useTheme } from "@/components/ThemeProvider";
import { getPersona } from "@/lib/utils";
import { Image } from "react-native";

export default function ProfilePage() {
  const router = useRouter();
  const { state, exportData, importData, resetAll, hydrated, setUserAvatar } = useAppStore();
  const { theme, setTheme, colors } = useTheme();
  const [confirmReset, setConfirmReset] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);

  const stats = useMemo(() => {
    const completed = state.logs.filter((l) => l.status === "completed").length;
    const skipped = state.logs.filter((l) => l.status === "skipped").length;
    const total = completed + skipped;
    const consistency = total > 0 ? Math.round((completed / total) * 100) : 0;
    const highestStability = state.habits.reduce(
      (max, h) => Math.max(max, h.stabilityScore),
      0
    );
    return {
      completed,
      consistency,
      highestStability,
      ritualCount: state.habits.length,
    };
  }, [state]);

  const persona = getPersona(state.habits, state.logs);

  const toggleAvatarEditing = async () => {
    if (isEditingAvatar) {
      setUserAvatar(pendingAvatar);
      setIsEditingAvatar(false);
    } else {
      setPendingAvatar(state.userAvatar ?? null);
      setIsEditingAvatar(true);
    }
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const dataUrl = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setPendingAvatar(dataUrl);
    }
  };

  const handleExport = async () => {
    const data = exportData();
    const fileUri = FileSystem.cacheDirectory + `begin-export-${new Date().toISOString().split("T")[0]}.json`;
    await FileSystem.writeAsStringAsync(fileUri, data);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, { mimeType: "application/json" });
    } else {
      Alert.alert("Export", "Sharing is not available on this device");
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const ok = importData(content);
      Alert.alert(ok ? "Data imported" : "Invalid file", ok ? "Your data has been restored." : "The file could not be read.");
    } catch {
      Alert.alert("Error", "Could not import file");
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Erase everything?",
      "This removes all habits and history from this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, erase",
          style: "destructive",
          onPress: () => {
            resetAll();
            router.replace("/");
          },
        },
      ]
    );
  };

  if (!hydrated) return null;

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: colors.bgBase }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
        <View>
          <Text style={[styles.subtitle, { color: colors.fgTertiary }]}>You</Text>
          <Text style={[styles.title, { color: colors.fgPrimary }]}>Profile</Text>
        </View>
        <Pressable
          onPress={() => router.push("/help")}
          style={[styles.helpButton, { backgroundColor: colors.bgSubtle }]}
        >
          <HelpCircle size={20} color={colors.fgSecondary} strokeWidth={1.6} />
        </Pressable>
      </Animated.View>

      {/* Profile card */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(700)}
        style={[styles.profileCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
      >
        <View style={styles.profileHeader}>
          <Pressable
            onPress={isEditingAvatar ? pickAvatar : undefined}
            style={styles.avatarContainer}
          >
            <LinearGradient
              colors={[colors.accent, colors.sage]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              {(pendingAvatar || state.userAvatar) ? (
                <Image
                  source={{ uri: pendingAvatar || state.userAvatar || "" }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarLetter}>
                  {state.userName.charAt(0).toUpperCase() || "B"}
                </Text>
              )}
            </LinearGradient>
            {isEditingAvatar && (
              <View style={styles.avatarEditOverlay}>
                <Edit size={20} color="#fff" />
              </View>
            )}
          </Pressable>

          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.fgPrimary }]}>
              {state.userName}
            </Text>
            <Text style={[styles.profilePersona, { color: colors.fgSecondary }]}>
              {persona}
            </Text>
          </View>

          <Pressable onPress={toggleAvatarEditing} style={styles.editAvatarButton}>
            {isEditingAvatar ? (
              <Check size={18} color={colors.accent} />
            ) : (
              <Edit size={18} color={colors.fgTertiary} />
            )}
          </Pressable>
          <Pressable onPress={() => setShareOpen(true)} style={styles.editAvatarButton}>
            <Share2 size={18} color={colors.fgTertiary} />
          </Pressable>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatItem label="Completed" value={String(stats.completed)} colors={colors} />
          <StatItem label="Consistency" value={`${stats.consistency}%`} colors={colors} />
          <StatItem label="Best stability" value={String(Math.round(stats.highestStability))} colors={colors} />
          <StatItem label="Rituals" value={String(stats.ritualCount)} colors={colors} />
        </View>
      </Animated.View>

      {/* Settings */}
      <Animated.View entering={FadeInDown.delay(200).duration(700)} style={styles.settingsSection}>
        {/* Theme */}
        <View style={styles.settingsGroup}>
          <Text style={[styles.settingsLabel, { color: colors.fgTertiary }]}>Appearance</Text>
          <View style={styles.themeRow}>
            {[
              { value: "light" as const, label: "Light", icon: Sun },
              { value: "dark" as const, label: "Dark", icon: Moon },
              { value: "system" as const, label: "System", icon: Monitor },
            ].map((opt) => {
              const Icon = opt.icon;
              const active = theme === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setTheme(opt.value)}
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor: active ? colors.accentBg : colors.bgSubtle,
                      borderColor: active ? colors.accent + "30" : "transparent",
                    },
                  ]}
                >
                  <Icon
                    size={20}
                    color={active ? colors.accent : colors.fgSecondary}
                    strokeWidth={active ? 2 : 1.6}
                  />
                  <Text
                    style={[
                      styles.themeButtonText,
                      { color: active ? colors.accent : colors.fgSecondary },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Data */}
        <View style={styles.settingsGroup}>
          <Text style={[styles.settingsLabel, { color: colors.fgTertiary }]}>Your data</Text>
          <Pressable
            onPress={handleExport}
            style={[styles.dataButton, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
          >
            <Upload size={20} color={colors.accent} strokeWidth={1.6} />
            <View>
              <Text style={[styles.dataButtonTitle, { color: colors.fgPrimary }]}>Export data</Text>
              <Text style={[styles.dataButtonDesc, { color: colors.fgTertiary }]}>
                Download a JSON backup
              </Text>
            </View>
          </Pressable>
          <Pressable
            onPress={handleImport}
            style={[styles.dataButton, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
          >
            <Download size={20} color={colors.accent} strokeWidth={1.6} />
            <View>
              <Text style={[styles.dataButtonTitle, { color: colors.fgPrimary }]}>Import data</Text>
              <Text style={[styles.dataButtonDesc, { color: colors.fgTertiary }]}>
                Restore from a backup
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Reset */}
        <View style={styles.settingsGroup}>
          <Text style={[styles.settingsLabel, { color: colors.fgTertiary }]}>Reset</Text>
          <Pressable
            onPress={handleReset}
            style={[styles.dataButton, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
          >
            <Text style={[styles.dataButtonTitle, { color: colors.fgSecondary }]}>Start over</Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* Share Modal */}
      <Modal
        visible={shareOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setShareOpen(false)}
      >
        <View style={styles.shareModalBackdrop}>
          <Pressable style={styles.shareModalClose} onPress={() => setShareOpen(false)}>
            <X size={20} color="#fff" />
          </Pressable>
          <View style={styles.shareCard}>
            <LinearGradient
              colors={["#6E78B8", "#8B92C9", "#7E997D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.shareCardContent}>
              <View style={styles.shareCardHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={styles.shareCardLogo}>
                    <Sparkles size={16} color="#fff" strokeWidth={1.6} />
                  </View>
                  <Text style={styles.shareCardBrand}>BEGIN</Text>
                </View>
                {state.userAvatar ? (
                  <Image
                    source={{ uri: state.userAvatar }}
                    style={styles.shareCardAvatar}
                  />
                ) : null}
              </View>

              <View style={styles.shareCardBody}>
                <Text style={styles.shareCardName}>
                  {state.userName || "a quiet ritualist"}
                </Text>
                <Text style={styles.shareCardPersona}>
                  &ldquo;{persona}&rdquo;
                </Text>
              </View>

              <View style={styles.shareCardStats}>
                <View style={styles.shareStatItem}>
                  <Text style={styles.shareStatValue}>{stats.ritualCount}</Text>
                  <Text style={styles.shareStatLabel}>Rituals</Text>
                </View>
                <View style={styles.shareStatItem}>
                  <Text style={styles.shareStatValue}>{stats.completed}</Text>
                  <Text style={styles.shareStatLabel}>Done</Text>
                </View>
                <View style={styles.shareStatItem}>
                  <Text style={styles.shareStatValue}>{Math.round(stats.highestStability)}</Text>
                  <Text style={styles.shareStatLabel}>Stability</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function StatItem({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: colors.fgPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.fgTertiary }]}>{label}</Text>
    </View>
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
    alignItems: "flex-start",
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
  helpButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    marginBottom: 32,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 24,
  },
  avatarLetter: {
    color: "#fff",
    fontSize: 28,
    fontFamily: "Fraunces",
  },
  avatarEditOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "500",
    fontFamily: "Manrope",
  },
  profilePersona: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
    fontFamily: "Manrope",
  },
  editAvatarButton: {
    padding: 8,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  statItem: {
    width: "46%",
    gap: 4,
  },
  statValue: {
    fontFamily: "Fraunces",
    fontSize: 24,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontFamily: "Manrope",
  },
  settingsSection: {
    gap: 32,
  },
  settingsGroup: {
    gap: 12,
  },
  settingsLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 2.5,
    paddingHorizontal: 8,
    fontFamily: "Manrope",
  },
  themeRow: {
    flexDirection: "row",
    gap: 8,
  },
  themeButton: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  themeButtonText: {
    fontSize: 12,
    fontFamily: "Manrope",
  },
  dataButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  dataButtonTitle: {
    fontSize: 15,
    fontFamily: "Manrope",
    letterSpacing: -0.3,
  },
  dataButtonDesc: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: "Manrope",
  },
  shareModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(14, 16, 20, 0.92)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  shareModalClose: {
    position: "absolute",
    top: 48,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  shareCard: {
    width: "100%",
    maxWidth: 340,
    aspectRatio: 4 / 5,
    borderRadius: 24,
    overflow: "hidden",
  },
  shareCardContent: {
    flex: 1,
    padding: 32,
    justifyContent: "space-between",
  },
  shareCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  shareCardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  shareCardLogo: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  shareCardBrand: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 3,
    textTransform: "uppercase",
    fontFamily: "Manrope",
  },
  shareCardBody: {
    flex: 1,
    justifyContent: "center",
  },
  shareCardName: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 12,
    fontFamily: "Manrope",
  },
  shareCardPersona: {
    fontSize: 24,
    color: "#fff",
    fontFamily: "Fraunces",
    lineHeight: 32,
  },
  shareCardStats: {
    flexDirection: "row",
    gap: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  shareStatItem: {
    gap: 4,
  },
  shareStatValue: {
    fontSize: 22,
    color: "#fff",
    fontFamily: "Fraunces",
  },
  shareStatLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "Manrope",
  },
});
