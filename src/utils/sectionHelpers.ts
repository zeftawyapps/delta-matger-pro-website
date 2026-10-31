import React from 'react';
import { LocalizedString, SectionBackgroundConfig, WebsiteSection } from '../types';
import { formatColor } from './theme';

export function resolveLocalizedText(
  val?: string | LocalizedString | Record<string, string> | null,
  lang: string = 'ar'
): string {
  if (!val) return '';
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'object') {
    const localized = (val as Record<string, string>)[lang] || val.ar || val.en || '';
    return typeof localized === 'string' ? localized.trim() : '';
  }
  return '';
}

/**
 * Strict Zero Default Titles Rule:
 * Never generate or fallback to default titles if section.title is empty or whitespace.
 */
export function getSectionHeaderTexts(
  section?: Partial<WebsiteSection> | { title?: any; description?: any; subtitle?: any },
  lang: string = 'ar'
): { titleText: string; descText: string; hasHeader: boolean } {
  const titleText = resolveLocalizedText(section?.title, lang);
  const descText =
    resolveLocalizedText(section?.description, lang) ||
    resolveLocalizedText(section?.subtitle, lang);
  const hasHeader = Boolean(titleText || descText);
  return { titleText, descText, hasHeader };
}

/**
 * Generates inline styles and CSS class names for the Section Background & Color Rhythm Engine.
 * Smartly auto-detects the background mode even when `bgConfig.type` is omitted by the Admin UI!
 */
export function buildSectionBackgroundProps(
  bgConfig?: SectionBackgroundConfig,
  fallbackBgColor?: string
): {
  className: string;
  style: React.CSSProperties;
  glowStyle?: React.CSSProperties;
  dividerStyle?: React.CSSProperties;
  hasGlowOrb: boolean;
  hasActiveBackground: boolean;
  dividerTop?: 'none' | 'glow_line' | 'gradient_fade';
  dividerBottom?: 'none' | 'glow_line' | 'gradient_fade';
} {
  const rawGlow = formatColor(bgConfig?.glowColor);
  const rawSolid = formatColor(bgConfig?.solidColor || fallbackBgColor);
  const rawGrad = Array.isArray(bgConfig?.gradientColors)
    ? bgConfig!.gradientColors.map((c) => formatColor(c)).filter(Boolean)
    : [];

  // Auto-infer type if Admin UI did not explicitly set `type`
  let effectiveType = bgConfig?.type;
  if (!effectiveType || effectiveType === 'theme_default') {
    if (rawGrad.length >= 2) {
      effectiveType = 'gradient_linear';
    } else if (rawGlow) {
      effectiveType = 'mesh_glow';
    } else if (rawSolid) {
      effectiveType = 'solid';
    } else {
      effectiveType = 'theme_default';
    }
  }

  const dividerTop = bgConfig?.dividerTop;
  const dividerBottom = bgConfig?.dividerBottom;
  const hasDivider =
    Boolean(dividerTop && dividerTop !== 'none') ||
    Boolean(dividerBottom && dividerBottom !== 'none');

  if (effectiveType === 'theme_default' && !bgConfig?.hasPattern && !hasDivider) {
    return {
      className: 'sec-bg-default',
      style: {},
      hasGlowOrb: false,
      hasActiveBackground: false,
      dividerTop,
      dividerBottom,
    };
  }

  const classes: string[] = [`sec-bg-${effectiveType}`];
  if (bgConfig?.hasPattern) {
    classes.push('sec-bg-pattern');
  }

  const activeColor = rawGlow || rawSolid || 'var(--primary)';
  const style: React.CSSProperties = {
    '--section-glow-color': activeColor,
  } as React.CSSProperties;

  let hasGlowOrb = false;
  let glowStyle: React.CSSProperties | undefined;

  switch (effectiveType) {
    case 'solid':
      if (rawSolid) {
        style.backgroundColor = rawSolid;
      }
      break;

    case 'gradient_linear': {
      const angle = bgConfig?.gradientAngle ?? 135;
      if (rawGrad.length >= 2) {
        style.background = `linear-gradient(${angle}deg, ${rawGrad.join(', ')})`;
      } else if (rawGlow || rawSolid) {
        const c = rawGlow || rawSolid;
        style.background = `linear-gradient(${angle}deg, color-mix(in srgb, ${c} 22%, var(--surface)), var(--surface))`;
      }
      break;
    }

    case 'mesh_glow': {
      hasGlowOrb = true;
      const glowColor = rawGlow || rawSolid || 'var(--primary)';
      // Give the full-width section band a visible ambient tint across the entire viewport width
      style.background = `radial-gradient(circle at 50% 50%, color-mix(in srgb, ${glowColor} 18%, transparent) 0%, color-mix(in srgb, ${glowColor} 6%, transparent) 100%)`;
      glowStyle = {
        background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
      };
      break;
    }

    case 'subtle_tint': {
      const tintColor = rawGlow || rawSolid || 'var(--primary)';
      style.background = `color-mix(in srgb, ${tintColor} 10%, transparent)`;
      break;
    }

    case 'contrast_break': {
      if (rawSolid || rawGlow) {
        style.backgroundColor = rawSolid || rawGlow;
      }
      break;
    }

    case 'radial_spotlight': {
      const spotColor = rawGlow || rawSolid || 'var(--primary)';
      style.background = `radial-gradient(circle at center, color-mix(in srgb, ${spotColor} 20%, transparent) 0%, transparent 75%)`;
      break;
    }
  }

  const dividerStyle: React.CSSProperties | undefined =
    rawGlow || rawSolid
      ? {
          background: `linear-gradient(90deg, transparent, ${rawGlow || rawSolid}, transparent)`,
          boxShadow: `0 0 14px ${rawGlow || rawSolid}`,
          opacity: 0.85,
        }
      : undefined;

  return {
    className: classes.join(' '),
    style,
    glowStyle,
    dividerStyle,
    hasGlowOrb,
    hasActiveBackground: true,
    dividerTop,
    dividerBottom,
  };
}
