import { CSSProperties } from "react";
import { IntroSlideConfig, WebsiteConfig, WebsiteSection } from "../types";

type IntroKey = "introHybrid" | "introBlog" | "introStore";

const INTRO_KEY_BY_MODE: Record<string, IntroKey> = {
  hybrid: "introHybrid",
  blog: "introBlog",
  store: "introStore",
};

/**
 * Resolves intro styling for the active appMode from a specific section config.
 */
export function getIntroConfigFromSection(
  section: WebsiteSection | undefined,
  appMode: string
): IntroSlideConfig {
  if (!section) return {};
  const sType = (section.type || "").toLowerCase().trim();
  if (sType !== "intro_slides" && sType !== "intro" && sType !== "hero") return {};

  const key = INTRO_KEY_BY_MODE[appMode] ?? "introBlog";
  return (section.config?.[key] as IntroSlideConfig) ?? {};
}

/**
 * Resolves the intro slide configuration for the active appMode.
 *
 * Priority follows WEBSITE_CONFIG_GUIDE.md:
 *  - Finds the active `intro_slides` section.
 *  - Picks introHybrid / introBlog / introStore based on appMode.
 *  - Returns an empty object (component falls back to its own defaults) when missing.
 */
export function getIntroConfig(
  websiteConfig: WebsiteConfig | undefined,
  appMode: string
): IntroSlideConfig {
  const section = (websiteConfig?.sections ?? []).find((s) => {
    const sType = (s.type || "").toLowerCase().trim();
    return (sType === "intro_slides" || sType === "intro" || sType === "hero") && s.isActive !== false;
  });
  return getIntroConfigFromSection(section, appMode);
}

/** Defaults documented in the config guide, applied when a field is unset. */
export function withIntroDefaults(config: IntroSlideConfig): Required<
  Pick<
    IntroSlideConfig,
    "displayStyle" | "backgroundType" | "autoPlay" | "duration" | "indicatorType"
  >
> &
  IntroSlideConfig {
  return {
    backgroundType: "solid",
    autoPlay: true,
    duration: 4000,
    indicatorType: "dots",
    ...config,
    displayStyle: normalizeIntroDisplayStyle(
      config.displayStyle ?? "apple_fullscreen"
    ),
  };
}

/** Normalize section displayMode for IntroSlides (grid vs slide carousel). */
export function normalizeIntroDisplayMode(displayMode?: string): "grid" | "slide" {
  if (displayMode === "grid") return "grid";
  // Admin stores "slider", "horizontal_list", "scroll", or "slide".
  return "slide";
}

export function isGradientColor(value?: string): boolean {
  return !!value && value.includes("linear-gradient");
}

/** CSS for solid or gradient intro text (stored in textColor). */
export function getIntroTextStyle(
  textColor?: string,
  fallback = "var(--fg)"
): CSSProperties {
  const value = textColor?.trim();
  if (!value) return { color: fallback };
  if (isGradientColor(value)) {
    return {
      background: value,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      color: "transparent",
    };
  }
  return { color: value };
}

/** Maps legacy short style names to intro displayStyle values. */
export function normalizeIntroDisplayStyle(
  value?: string
): NonNullable<IntroSlideConfig["displayStyle"]> {
  const allowed = [
    "apple_fullscreen",
    "minimal_glass",
    "full_split",
    "classic_centered",
  ] as const;
  if (value && (allowed as readonly string[]).includes(value)) {
    return value as (typeof allowed)[number];
  }
  const legacy: Record<string, (typeof allowed)[number]> = {
    classic: "classic_centered",
    glass: "minimal_glass",
    split: "full_split",
    apple: "apple_fullscreen",
  };
  return legacy[value ?? ""] ?? "apple_fullscreen";
}

/** Default: classic → center (legacy blog hero); other styles → start (side by language). */
export function normalizeIntroTextAlign(
  value?: string,
  displayStyle?: string
): "start" | "center" | "end" {
  if (value === "start" || value === "center" || value === "end") return value;
  if (displayStyle === "classic_centered") return "center";
  return "start";
}
