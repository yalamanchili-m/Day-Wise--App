import React, { createContext, useState, useContext, useEffect } from "react";

const ThemeContext = createContext();

const themes = {
  light: {
    name: "Light",
    bg: "bg-gray-50",
    card: "bg-white",
    cardSolid: "bg-white",
    text: "text-gray-900",
    textSecondary: "text-gray-500",
    border: "border-gray-100",
    accent: "from-indigo-500 to-purple-600",
    shadow: "shadow-xl",
  },
  dark: {
    name: "Dark",
    bg: "bg-gray-900",
    card: "bg-gray-800",
    cardSolid: "bg-gray-800",
    text: "text-white",
    textSecondary: "text-gray-400",
    border: "border-gray-700",
    accent: "from-violet-500 to-fuchsia-600",
    shadow: "shadow-xl shadow-black/20",
  },
  rose: {
    name: "Rose",
    bg: "bg-rose-50",
    card: "bg-white",
    cardSolid: "bg-white",
    text: "text-rose-900",
    textSecondary: "text-rose-500",
    border: "border-rose-100",
    accent: "from-rose-400 to-pink-500",
    shadow: "shadow-xl shadow-rose-200/50",
  },
  emerald: {
    name: "Emerald",
    bg: "bg-emerald-50",
    card: "bg-white",
    cardSolid: "bg-white",
    text: "text-emerald-900",
    textSecondary: "text-emerald-600",
    border: "border-emerald-100",
    accent: "from-emerald-400 to-teal-500",
    shadow: "shadow-xl shadow-emerald-200/50",
  },
  sapphire: {
    name: "Sapphire",
    bg: "bg-blue-50",
    card: "bg-white",
    cardSolid: "bg-white",
    text: "text-blue-900",
    textSecondary: "text-blue-600",
    border: "border-blue-100",
    accent: "from-blue-500 to-indigo-600",
    shadow: "shadow-xl shadow-blue-200/50",
  },
  amber: {
    name: "Amber",
    bg: "bg-amber-50",
    card: "bg-white",
    cardSolid: "bg-white",
    text: "text-amber-900",
    textSecondary: "text-amber-600",
    border: "border-amber-100",
    accent: "from-amber-500 to-orange-600",
    shadow: "shadow-xl shadow-amber-200/50",
  },
};

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setCurrentTheme(saved);
  }, []);

  const setTheme = (themeName) => {
    setCurrentTheme(themeName);
    localStorage.setItem("theme", themeName);
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[currentTheme], setTheme, currentTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}