"use client";

import { create } from "zustand";
import { AppMode } from "@/types";

interface UIState {
  theme: string;
  lang: "ar" | "en";
  searchQuery: string;
  appMode: AppMode;

  setTheme: (theme: string) => void;
  toggleTheme: () => void;
  setLang: (lang: "ar" | "en") => void;
  changeLanguage: (newLang: string) => void;
  setSearchQuery: (query: string) => void;
  setAppMode: (mode: AppMode) => void;
  setAppModeDirect: (mode: AppMode) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: "light",
  lang: "ar",
  searchQuery: "",
  appMode: "blog",

  setTheme: (theme) => set({ theme }),

  toggleTheme: () => {
    const newTheme = get().theme === "light" ? "dark" : "light";
    set({ theme: newTheme });
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
      const meta = document.querySelector('meta[name="color-scheme"]');
      if (meta) meta.setAttribute("content", newTheme);
    }
  },

  setLang: (lang) => set({ lang }),

  changeLanguage: (newLang) => {
    const checkedLang = newLang === "en" ? "en" : "ar";
    set({ lang: checkedLang });
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", checkedLang);
    }
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setAppModeDirect: (appMode) => set({ appMode }),

  setAppMode: (mode) => {
    set({ appMode: mode });
    if (typeof window !== "undefined") {
      localStorage.setItem("appMode", mode);
    }
  },
}));

