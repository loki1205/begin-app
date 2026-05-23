# Begin — React Native Expo App

A calm, premium microhabits tracker for small, intentional rituals. Native mobile port of the Begin web application.

## Tech Stack

- **Expo** (SDK 52) with Expo Router for file-based navigation
- **React Native Reanimated** for smooth 60fps animations
- **NativeWind** (Tailwind CSS for React Native) for consistent styling
- **React Native Gesture Handler** for swipe interactions
- **AsyncStorage** for local-only data persistence
- **Expo Linear Gradient** for gradient effects
- **lucide-react-native** for icons

## Project Structure

```
app/
├── _layout.tsx              # Root layout with font loading & providers
├── index.tsx                # Splash screen
├── onboarding.tsx           # Name onboarding flow
├── help.tsx                 # Help & About screen
├── edit/
│   └── [id].tsx             # Edit habit (dynamic route)
└── (tabs)/
    ├── _layout.tsx          # Tab bar configuration
    ├── today.tsx            # Today's habits
    ├── history.tsx          # History with date picker
    ├── add.tsx              # Add new habit
    ├── tasks.tsx            # All rituals view
    └── profile.tsx          # Profile & settings
src/
├── components/
│   ├── ThemeProvider.tsx    # Dark/light theme context
│   ├── HabitRow.tsx         # Swipeable habit row component
│   └── WheelPicker.tsx      # Scroll wheel date picker
└── lib/
    ├── store.ts             # App state with AsyncStorage
    └── utils.ts             # Types, helpers, constants
```

## Getting Started

```bash
cd app/mobile
npm install
npx expo start
```

## Design Principles

- **Visual parity** with the web application
- **Fraunces** display font + **Manrope** sans-serif
- Glass-morphism card aesthetic with subtle borders
- Gradient accents: `#004fe1` (accent) → `#0cbaba` (sage)
- Light/dark theme support following system preference
- Haptic feedback on interactions
- Swipe gestures for habit completion/skipping

## Navigation

| Web Route | Mobile Screen |
|-----------|---------------|
| `/` | `app/index.tsx` (splash) |
| `/onboarding` | `app/onboarding.tsx` |
| `/today` | `app/(tabs)/today.tsx` |
| `/add` | `app/(tabs)/add.tsx` |
| `/tasks` | `app/(tabs)/tasks.tsx` |
| `/history` | `app/(tabs)/history.tsx` |
| `/profile` | `app/(tabs)/profile.tsx` |
| `/help` | `app/help.tsx` |
| `/edit/[id]` | `app/edit/[id].tsx` |

## Data Storage

All data is stored locally using `@react-native-async-storage/async-storage`. No server, no accounts. Export/import via JSON.
