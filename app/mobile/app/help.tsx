import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Linking } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import {
  Code,
  Heart,
  Bug,
  Users,
  ChevronDown,
  ArrowLeft,
} from "lucide-react-native";
import { useTheme } from "@/components/ThemeProvider";

const FAQS = [
  {
    q: "What makes Begin different?",
    a: "Begin is built around one idea: quiet consistency matters more than loud motivation. There is no stability shaming, no notifications begging for your attention, no gamification. Just a calm place to return to.",
  },
  {
    q: "Where is my data stored?",
    a: "Everything lives locally on this device. We have no servers, no accounts, and no analytics. Use Export to back up your data.",
  },
  {
    q: "Why can I skip habits?",
    a: "Because life happens. Skipping is a way to honestly mark a day without breaking your sense of self. It's better than guilt-completion.",
  },
  {
    q: "How is stability score calculated?",
    a: "Stability score grows with completed scheduled days and gently decreases for missed days. It measures consistency without pressure.",
  },
];

const LINKS = [
  {
    title: "GitHub Repository",
    description: "Source code and releases",
    icon: Code,
    href: "https://github.com/loki1205/begin-app",
  },
  {
    title: "Report a bug",
    description: "Something feel off?",
    icon: Bug,
    href: "https://github.com/loki1205/begin-app/issues",
  },
  {
    title: "Show Appreciation",
    description: "Share your feedback/love for Begin",
    icon: Heart,
    href: "mailto:loknath12502@gmail.com?subject=Appreciation%20for%20Begin",
  },
  {
    title: "Contributors",
    description: "The people behind it",
    icon: Users,
    href: "https://github.com/loki1205/begin-app/graphs/contributors",
  },
];

export default function HelpPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: colors.bgBase }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeIn.duration(600)} style={styles.headerSection}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={16} color={colors.fgTertiary} />
          <Text style={[styles.backText, { color: colors.fgTertiary }]}>Back</Text>
        </Pressable>
        <Text style={[styles.subtitle, { color: colors.fgTertiary }]}>About</Text>
        <Text style={[styles.title, { color: colors.fgPrimary }]}>Help & About</Text>
      </Animated.View>

      {/* Manifesto */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(700)}
        style={[styles.manifestoCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
      >
        <Text style={[styles.manifestoText, { color: colors.fgPrimary }]}>
          Begin is about small consistent actions. It is for the kind of person
          who would rather walk than run, and who knows that becoming someone is
          slower and quieter than it looks.
        </Text>
      </Animated.View>

      {/* FAQs */}
      <Animated.View entering={FadeInDown.delay(200).duration(700)} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.fgTertiary }]}>Questions</Text>
        {FAQS.map((faq, i) => (
          <View
            key={i}
            style={[styles.faqCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
          >
            <Pressable
              onPress={() => setOpenFaq(openFaq === i ? null : i)}
              style={styles.faqHeader}
            >
              <Text style={[styles.faqQuestion, { color: colors.fgPrimary }]}>
                {faq.q}
              </Text>
              <ChevronDown
                size={16}
                color={colors.fgTertiary}
                style={{ transform: [{ rotate: openFaq === i ? "180deg" : "0deg" }] }}
              />
            </Pressable>
            {openFaq === i && (
              <Text style={[styles.faqAnswer, { color: colors.fgSecondary }]}>
                {faq.a}
              </Text>
            )}
          </View>
        ))}
      </Animated.View>

      {/* Links */}
      <Animated.View entering={FadeInDown.delay(300).duration(700)} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.fgTertiary }]}>Community</Text>
        <View style={styles.linksGrid}>
          {LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Pressable
                key={link.title}
                onPress={() => Linking.openURL(link.href)}
                style={[styles.linkCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
              >
                <Icon size={20} color={colors.accent} strokeWidth={1.6} />
                <Text style={[styles.linkTitle, { color: colors.fgPrimary }]}>
                  {link.title}
                </Text>
                <Text style={[styles.linkDesc, { color: colors.fgTertiary }]}>
                  {link.description}
                </Text>
              </Pressable>
            );
          })}
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
    marginBottom: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  backText: {
    fontSize: 14,
    fontFamily: "Manrope",
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
  manifestoCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    marginBottom: 32,
  },
  manifestoText: {
    fontFamily: "Fraunces",
    fontSize: 20,
    fontStyle: "italic",
    lineHeight: 30,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 2.5,
    marginBottom: 16,
    paddingHorizontal: 8,
    fontFamily: "Manrope",
  },
  faqCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    overflow: "hidden",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    gap: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "Manrope",
    letterSpacing: -0.3,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 20,
    paddingBottom: 20,
    fontFamily: "Manrope",
  },
  linksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  linkCard: {
    width: "47%",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    gap: 8,
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "Manrope",
    letterSpacing: -0.3,
    marginTop: 4,
  },
  linkDesc: {
    fontSize: 12,
    fontFamily: "Manrope",
  },
});
