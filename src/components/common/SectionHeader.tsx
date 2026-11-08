"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { resolveLocalizedText } from "@/utils/sectionHelpers";
import { LocalizedString, SectionTitleStyle, SectionTitleAlign, SectionTitleSize } from "@/types";
import styles from "./SectionHeader.module.css";

export interface SectionHeaderProps {
  title?: string | LocalizedString | null;
  subtitle?: string | LocalizedString | null;
  description?: string | LocalizedString | null;
  badge?: string | LocalizedString | null;
  config?: {
    titleAlign?: SectionTitleAlign;
    titleStyle?: SectionTitleStyle;
    titleSize?: SectionTitleSize;
    titleColor?: string;
    subtitleColor?: string;
    badgeText?: string | LocalizedString | null;
    badgeColor?: string;
    badgeBg?: string;
    [key: string]: any;
  };
  actionButton?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function SectionHeader({
  title,
  subtitle,
  description,
  badge,
  config,
  actionButton,
  className = "",
  style,
}: SectionHeaderProps) {
  const { lang } = useApp();

  const titleStr = resolveLocalizedText(title || config?.title, lang);
  const subStr = resolveLocalizedText(subtitle || description || config?.subtitle || config?.description, lang);
  const rawBadge =
    badge ||
    config?.badgeText ||
    config?.badge_text ||
    config?.badge ||
    config?.badgeTitle ||
    config?.badge_title ||
    config?.tag ||
    config?.label;
  const badgeStr = resolveLocalizedText(rawBadge, lang);

  // Fallback badge text if badge_header style was explicitly chosen without a custom badge text
  const rawStyle = config?.titleStyle || (badgeStr ? "badge_header" : "gradient");
  const effectiveBadge = badgeStr || (rawStyle === "badge_header" ? (lang === "ar" ? "مقالات مختارة" : "Featured") : "");

  // Strict Zero Default Titles rule: if title, subtitle and badge are all empty, render nothing
  if (!titleStr && !subStr && !effectiveBadge && !actionButton) {
    return null;
  }

  const rawAlign = config?.titleAlign || (actionButton ? "split" : "start");
  const align = rawAlign === "center" ? "align_center" : rawAlign === "split" ? "align_split" : "align_start";

  const titleVariantClass =
    rawStyle === "solid"
      ? styles.style_solid
      : rawStyle === "glow"
        ? styles.style_glow
        : rawStyle === "accent_bar"
          ? styles.style_accent_bar
          : rawStyle === "badge_header"
            ? styles.style_badge_header
            : rawStyle === "flanked_lines" || rawStyle === "underlined"
              ? styles.style_solid
              : styles.style_gradient;

  const rawSize = config?.titleSize || "md";
  let sizeClass = styles[`size_${rawSize}`];
  const customFontSizeStyle: React.CSSProperties = {};

  if (!sizeClass) {
    if (typeof rawSize === "number") {
      customFontSizeStyle.fontSize = `${rawSize}px`;
    } else if (
      typeof rawSize === "string" &&
      (rawSize.endsWith("px") || rawSize.endsWith("rem") || rawSize.endsWith("em") || rawSize.endsWith("vw"))
    ) {
      customFontSizeStyle.fontSize = rawSize;
    } else if (rawSize === "2xl" || rawSize === "xxl") {
      sizeClass = styles.size_xl;
    } else if (rawSize === "xs") {
      sizeClass = styles.size_sm;
    } else {
      sizeClass = styles.size_md;
    }
  }

  const isSolid = rawStyle === "solid";
  const isGlow = rawStyle === "glow";
  const isGradient = rawStyle === "gradient" || (!isSolid && !isGlow && rawStyle !== "accent_bar" && rawStyle !== "flanked_lines" && rawStyle !== "underlined");

  const titleCustomStyle: React.CSSProperties = {
    ...customFontSizeStyle,
    ...(rawAlign === "center" ? { textAlign: "center" as const, width: "100%" } : {}),
  };

  if (isSolid) {
    const solidColor = config?.titleColor || "var(--fg)";
    titleCustomStyle.color = solidColor;
    titleCustomStyle.WebkitTextFillColor = solidColor;
    titleCustomStyle.background = "none";
    titleCustomStyle.backgroundImage = "none";
    titleCustomStyle.WebkitBackgroundClip = "unset";
    titleCustomStyle.backgroundClip = "unset";
  } else if (isGlow) {
    const glowColor = config?.glowColor || config?.titleColor || "var(--primary)";
    const textColor = config?.titleColor || "var(--fg)";
    titleCustomStyle.color = textColor;
    titleCustomStyle.WebkitTextFillColor = textColor;
    titleCustomStyle.textShadow = `0 0 24px color-mix(in srgb, ${glowColor} 50%, transparent)`;
  } else if (isGradient && Array.isArray(config?.titleGradient) && config.titleGradient.length >= 2 && !config?.titleColor) {
    titleCustomStyle.background = `linear-gradient(135deg, ${config.titleGradient.join(", ")})`;
    titleCustomStyle.WebkitBackgroundClip = "text";
    titleCustomStyle.backgroundClip = "text";
    titleCustomStyle.WebkitTextFillColor = "transparent";
  } else if (config?.titleColor) {
    titleCustomStyle.color = config.titleColor;
    titleCustomStyle.WebkitTextFillColor = config.titleColor;
    titleCustomStyle.background = "none";
    titleCustomStyle.backgroundImage = "none";
    titleCustomStyle.WebkitBackgroundClip = "unset";
    titleCustomStyle.backgroundClip = "unset";
  }

  const accentColor = config?.accentColor || config?.titleColor || "var(--primary)";
  const accentBarStyle: React.CSSProperties = {
    background: `linear-gradient(90deg, ${accentColor}, var(--secondary, #7850dc))`,
    boxShadow: `0 0 10px color-mix(in srgb, ${accentColor} 40%, transparent)`,
  };

  const flankLineStyle: React.CSSProperties = {
    background: `linear-gradient(90deg, transparent, color-mix(in srgb, ${accentColor} 70%, transparent))`,
  };

  const flankLineRightStyle: React.CSSProperties = {
    background: `linear-gradient(90deg, color-mix(in srgb, ${accentColor} 70%, transparent), transparent)`,
  };

  const subtitleCustomStyle: React.CSSProperties = {
    ...(config?.subtitleColor ? { color: config.subtitleColor, opacity: 1 } : {}),
  };

  const rawBadgeColor =
    config?.badgeColor ||
    config?.badge_color ||
    config?.badgeTextColor ||
    config?.badge_text_color;

  const rawBadgeBg =
    config?.badgeBg ||
    config?.badge_bg ||
    config?.badgeBackground ||
    config?.badge_background ||
    config?.badgeBackgroundColor;

  const badgeCustomStyle: React.CSSProperties = {
    ...(rawBadgeColor
      ? {
          color: rawBadgeColor,
          borderColor: rawBadgeColor,
          border: `1.5px solid ${rawBadgeColor}`,
        }
      : {}),
    ...(rawBadgeBg
      ? {
          background: rawBadgeBg,
          backgroundColor: rawBadgeBg,
          backgroundImage: "none",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
          backdropFilter: "none",
          WebkitBackdropFilter: "none",
        }
      : {}),
  };

  return (
    <div
      className={`${styles.headerWrapper} ${styles[align]} ${className}`}
      style={style}
    >
      <div className={styles.titleArea}>
        {effectiveBadge && (
          <span className={styles.headerBadge} style={badgeCustomStyle}>
            {effectiveBadge}
          </span>
        )}

        {titleStr && (
          rawStyle === "flanked_lines" ? (
            <div className={styles.titleFlankedWrapper}>
              <span className={styles.flankLine} style={flankLineStyle} />
              <h2
                className={`${styles.title} ${sizeClass} ${titleVariantClass}`}
                style={titleCustomStyle}
              >
                {titleStr}
              </h2>
              <span className={`${styles.flankLine} ${styles.flankLineRight}`} style={flankLineRightStyle} />
            </div>
          ) : (
            <h2
              className={`${styles.title} ${sizeClass} ${titleVariantClass}`}
              style={titleCustomStyle}
            >
              {titleStr}
            </h2>
          )
        )}

        {rawStyle === "accent_bar" && <div className={styles.accentBar} style={accentBarStyle} />}
        {rawStyle === "underlined" && <div className={styles.underlinedBar} style={accentBarStyle} />}

        {subStr && (
          <p className={styles.subtitle} style={subtitleCustomStyle}>
            {subStr}
          </p>
        )}
      </div>

      {actionButton && <div className={styles.actionWrapper}>{actionButton}</div>}
    </div>
  );
}

