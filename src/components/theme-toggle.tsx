"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

const THEME_KEY = "littleworks-theme";
const THEME_EVENT = "littleworks-theme-change";
type Theme = "light" | "dark";

function getTheme(defaultTheme: Theme): Theme {
  const saved = window.localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return defaultTheme;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_EVENT, callback);
  };
}

export function ThemeToggle({ defaultTheme = "light" }: { defaultTheme?: Theme }) {
  const theme = useSyncExternalStore(subscribe, () => getTheme(defaultTheme), () => defaultTheme);
  const dark = theme === "dark";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggle() {
    const next: Theme = dark ? "light" : "dark";
    window.localStorage.setItem(THEME_KEY, next);
    document.documentElement.dataset.theme = next;
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <button className="theme-toggle" type="button" onClick={toggle} aria-label={dark ? "切换到浅色主题" : "切换到深色主题"} title={dark ? "浅色主题" : "深色主题"}>
      {dark ? <Sun size={17} strokeWidth={1.7} /> : <Moon size={17} strokeWidth={1.7} />}
    </button>
  );
}
