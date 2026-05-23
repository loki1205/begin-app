import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
  colors: typeof lightColors;
}

const STORAGE_KEY = "begin.theme";

export const lightColors = {
  bgBase: "#FBFAF7",
  bgElevated: "#FFFFFF",
  bgSubtle: "#F6F4EE",
  bgTint: "rgba(255, 255, 255, 0.6)",
  borderSubtle: "rgba(20, 23, 29, 0.06)",
  borderStrong: "rgba(20, 23, 29, 0.12)",
  fgPrimary: "#14171D",
  fgSecondary: "#5A5F6A",
  fgTertiary: "#8A8F99",
  fgQuaternary: "#B4B8C0",
  accent: "#004fe1",
  accentBg: "rgba(110, 120, 184, 0.08)",
  sage: "#0cbaba",
  glassBg: "rgba(255, 255, 255, 0.85)",
  glassBorder: "rgba(20, 23, 29, 0.08)",
};

export const darkColors = {
  bgBase: "#0E1014",
  bgElevated: "#14171D",
  bgSubtle: "#1B1F27",
  bgTint: "rgba(255, 255, 255, 0.02)",
  borderSubtle: "rgba(255, 255, 255, 0.06)",
  borderStrong: "rgba(255, 255, 255, 0.12)",
  fgPrimary: "#F0EDE5",
  fgSecondary: "#A8ACB5",
  fgTertiary: "#6B6F78",
  fgQuaternary: "#44484F",
  accent: "#004fe1",
  accentBg: "rgba(139, 146, 201, 0.12)",
  sage: "#0cbaba",
  glassBg: "rgba(27, 31, 39, 0.55)",
  glassBorder: "rgba(255, 255, 255, 0.06)",
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(
    systemScheme === "dark" ? "dark" : "light"
  );

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemeState(stored);
      }
    });
  }, []);

  useEffect(() => {
    const resolved =
      theme === "system"
        ? systemScheme === "dark"
          ? "dark"
          : "light"
        : theme;
    setResolvedTheme(resolved);
  }, [theme, systemScheme]);

  const setTheme = useCallback((t: Theme) => {
    AsyncStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
  }, []);

  const colors = resolvedTheme === "dark" ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be within ThemeProvider");
  return ctx;
}
