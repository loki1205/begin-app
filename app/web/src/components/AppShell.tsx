"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Home, CalendarDays, Plus, User, HelpCircle, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/today", label: "Today", icon: Home },
  { href: "/history", label: "History", icon: CalendarDays },
  { href: "/add", label: "Add", icon: Plus, primary: true },
  { href: "/tasks", label: "Tasks", icon: List },
  { href: "/profile", label: "Profile", icon: User }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, hydrated } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Routing logic for splash/onboarding
  useEffect(() => {
    if (!hydrated || !mounted) return;
    const isRoot = pathname === "/";
    const isOnboarding = pathname.startsWith("/onboarding");

    if (isRoot && state.onboarded) {
      router.replace("/today");
    } else if (isRoot && !state.onboarded) {
      // splash page handles its own transition to onboarding
    } else if (!state.onboarded && !isOnboarding && !isRoot) {
      router.replace("/onboarding");
    }
  }, [hydrated, mounted, pathname, state.onboarded, router]);

  const hideChrome =
    pathname === "/" ||
    pathname.startsWith("/onboarding");

  if (hideChrome) {
    return <main className="relative z-10 min-h-screen">{children}</main>;
  }

  return (
    <div className="relative z-10 flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 lg:w-64 xl:w-72 flex-col z-30 p-6">
        <div className="glass-elevated rounded-3xl flex-1 flex flex-col p-6 xl:p-8">
          {/* Logo */}
          <Link href="/today" className="flex items-center gap-3 mb-12 group">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--sage)] flex items-center justify-center glossy depth-2">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none">
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
                <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
              </svg>
            </div>
            <div>
              <div className="font-display text-2xl pb-1 tracking-tight leading-none">
                begin
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--fg-tertiary)] mt-1">
                quiet consistency
              </div>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex flex-col gap-1 flex-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300",
                    active
                      ? "bg-[var(--accent-bg)] text-[var(--accent)]"
                      : "text-[var(--fg-secondary)] hover:bg-[var(--bg-tint)] hover:text-[var(--fg-primary)]"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-transform duration-300",
                      active && "scale-110"
                    )}
                    strokeWidth={active ? 2.2 : 1.6}
                  />
                  <span
                    className={cn(
                      "text-[15px] tracking-tight",
                      active ? "font-medium" : "font-normal"
                    )}
                  >
                    {item.label}
                  </span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Help link */}
          <Link
            href="/help"
            className="flex items-center gap-4 px-4 py-3 rounded-2xl text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-tint)] transition-colors"
          >
            <HelpCircle className="w-4 h-4" strokeWidth={1.6} />
            <span className="text-sm">Help & About</span>
          </Link>

          {/* User chip */}
          {state.userName && (
            <div className="mt-6 pt-6 border-t border-[var(--border-subtle)] flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-[var(--accent)] to-[var(--sage)] flex items-center justify-center text-white font-medium text-sm glossy">
                {state.userAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={state.userAvatar}
                    alt={`${state.userName} avatar`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  state.userName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">
                  {state.userName}
                </div>
                <div className="text-xs text-[var(--fg-tertiary)]">
                  {state.habits.length}{" "}
                  {state.habits.length === 1 ? "ritual" : "rituals"}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 grid place-items-center md:ml-56 lg:ml-64 xl:ml-72 pb-20 sm:pb-24 lg:pb-0 min-h-screen">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-6 lg:py-10 max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 z-30">
        <div className="glass-elevated rounded-3xl px-2 py-2 flex items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);

            if (item.primary) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative -mt-7"
                  aria-label={item.label}
                >
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 glossy",
                      "bg-gradient-to-br from-[var(--accent)] to-[var(--sage)]",
                      "shadow-[0_10px_30px_rgba(110,120,184,0.35)]",
                      active && "scale-105"
                    )}
                  >
                    <Icon
                      className="w-6 h-6 text-white"
                      strokeWidth={2.2}
                    />
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
                  active
                    ? "text-[var(--accent)]"
                    : "text-[var(--fg-tertiary)]"
                )}
                aria-label={item.label}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.2 : 1.8} />
                <span className="text-[10px] tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
