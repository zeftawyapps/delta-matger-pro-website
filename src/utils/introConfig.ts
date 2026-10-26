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
  const modeConfig = (section.config?.[key] as IntroSlideConfig) ?? {};

  const rootConfig: Partial<IntroSlideConfig> = {
    backgroundType: (section.config as any)?.backgroundType,
    customBg: (section.config as any)?.customBg ?? (section.config as any)?.background,
    textColor: (section.config as any)?.textColor,
    buttonText: (section.config as any)?.buttonText,
    buttonLink: (section.config as any)?.buttonLink ?? (section.config as any)?.linkUrl,
    fallbackTitle: (section.config as any)?.fallbackTitle,
    fallbackDescription: (section.config as any)?.fallbackDescription,
    buttonBg: (section.config as any)?.buttonBg,
    buttonTextColor: (section.config as any)?.buttonTextColor,
    buttonBackgroundType: (section.config as any)?.buttonBackgroundType,
    badgeText: (section.config as any)?.badgeText,
    badgeBg: (section.config as any)?.badgeBg,
    badgeTextColor: (section.config as any)?.badgeTextColor,
    slideSource: (section.config as any)?.slideSource ?? (section.config as any)?.contentSource,
    contentSource: (section.config as any)?.contentSource ?? (section.config as any)?.slideSource,
    displayStyle: (section.config as any)?.displayStyle,
    useGradientTitle: (section.config as any)?.useGradientTitle,
    showGlow: (section.config as any)?.showGlow,
    showBadge: (section.config as any)?.showBadge,
    buttonShape: (section.config as any)?.buttonShape,
    showButtonArrow: (section.config as any)?.showButtonArrow,
    showButton: (section.config as any)?.showButton,
    showHeroImage: (section.config as any)?.showHeroImage,
  };

  // Build clean merged config: modeConfig takes priority, but empty strings do NOT clobber rootConfig
  const merged: IntroSlideConfig = { ...rootConfig };
  for (const [k, v] of Object.entries(modeConfig)) {
    if (v !== "" && v !== null && v !== undefined) {
      (merged as any)[k] = v;
    } else if ((merged as any)[k] === undefined && v !== undefined) {
      (merged as any)[k] = v;
    }
  }

  // AUTO-TRANSFORMATION & HEALING (as requested by user):
  // 1. If buttonTextColor contains a gradient:
  //    The user intended this gradient for the button background! Transfer it to buttonBg!
  if (isGradientColor(merged.buttonTextColor)) {
    if (!isGradientColor(merged.buttonBg)) {
      merged.buttonBg = merged.buttonTextColor;
    }
    merged.buttonBackgroundType = "gradient";
    merged.buttonTextColor = "#FFFFFF";
  } else if (isGradientColor(merged.buttonBg)) {
    merged.buttonBackgroundType = "gradient";
  }

  // 2. If customBg contains a gradient, ensure backgroundType is "gradient"
  if (isGradientColor(merged.customBg)) {
    merged.backgroundType = "gradient";
  }

  return merged;
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
  return !!value && (value.includes("gradient") || value.includes("linear-gradient") || value.includes("radial-gradient"));
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
