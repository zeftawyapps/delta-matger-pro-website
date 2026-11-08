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
 * Accepts title/description from section root OR section.config (e.g. config.title, config.headline).
 */
export function getSectionHeaderTexts(
  section?: any,
  lang: string = 'ar'
): { titleText: string; descText: string; hasHeader: boolean } {
  const titleText =
    resolveLocalizedText(section?.title, lang) ||
    resolveLocalizedText(section?.config?.title, lang) ||
    resolveLocalizedText(section?.config?.headline, lang);
  const descText =
    resolveLocalizedText(section?.description, lang) ||
    resolveLocalizedText(section?.subtitle, lang) ||
    resolveLocalizedText(section?.config?.description, lang) ||
    resolveLocalizedText(section?.config?.subtitle, lang) ||
    resolveLocalizedText(section?.config?.subheadline, lang);
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

/**
 * Generates CSS variables for Card & Container Radius, Shadow, and Elevation/Hover.
 * Allows full fine-grained customization per section via admin config:
 * - config.cardRadius / config.borderRadius / config.radius
 * - config.cardShadow / config.shadow
 * - config.cardElevation / config.elevation / config.hoverElevation
 */
export function buildCardStyleProps(config?: any): Record<string, string> {
  if (!config) return {};

  const styleVars: Record<string, string> = {};

  // 1. Radius (reduce)
  const rawRadius = config.cardRadius ?? config.borderRadius ?? config.radius;
  if (rawRadius !== undefined && rawRadius !== null && rawRadius !== '') {
    if (typeof rawRadius === 'number') {
      styleVars['--card-radius'] = `${rawRadius}px`;
    } else {
      const r = String(rawRadius).trim().toLowerCase();
      const radiusMap: Record<string, string> = {
        none: '0px',
        square: '0px',
        '0': '0px',
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '40px',
        full: '9999px',
        pill: '9999px',
      };
      styleVars['--card-radius'] = radiusMap[r] || (r.endsWith('px') || r.endsWith('rem') || r.endsWith('%') ? r : `${r}px`);
    }
  }

  // 2. Shadow
  const rawShadow = config.cardShadow ?? config.shadow;
  if (rawShadow !== undefined && rawShadow !== null && rawShadow !== '') {
    if (rawShadow === false || rawShadow === 'none' || rawShadow === '0') {
      styleVars['--card-shadow'] = 'none';
      styleVars['--card-hover-shadow'] = 'none';
    } else if (rawShadow === true) {
      styleVars['--card-shadow'] = '0 8px 24px -4px rgba(0, 0, 0, 0.12)';
    } else {
      const s = String(rawShadow).trim().toLowerCase();
      const shadowMap: Record<string, string> = {
        none: 'none',
        sm: '0 2px 8px -1px rgba(0, 0, 0, 0.06)',
        subtle: '0 2px 8px -1px rgba(0, 0, 0, 0.06)',
        md: '0 6px 20px -2px rgba(0, 0, 0, 0.10)',
        medium: '0 6px 20px -2px rgba(0, 0, 0, 0.10)',
        lg: '0 12px 32px -4px rgba(0, 0, 0, 0.16)',
        high: '0 12px 32px -4px rgba(0, 0, 0, 0.16)',
        xl: '0 20px 48px -6px rgba(0, 0, 0, 0.22)',
        floating: '0 20px 48px -6px rgba(0, 0, 0, 0.22)',
        glow: '0 0 25px color-mix(in srgb, var(--primary) 30%, transparent)',
      };
      styleVars['--card-shadow'] = shadowMap[s] || String(rawShadow);
    }
  }

  // 3. Elevation / Hover Lift
  const rawElev = config.cardElevation ?? config.elevation ?? config.hoverElevation ?? config.elevate;
  if (rawElev !== undefined && rawElev !== null && rawElev !== '') {
    if (rawElev === false || rawElev === 'none' || rawElev === '0' || rawElev === 0) {
      styleVars['--card-hover-elevation'] = '0px';
    } else if (typeof rawElev === 'number') {
      const absVal = Math.abs(rawElev);
      styleVars['--card-hover-elevation'] = `-${absVal}px`;
    } else {
      const e = String(rawElev).trim().toLowerCase();
      const elevMap: Record<string, string> = {
        none: '0px',
        low: '-3px',
        sm: '-3px',
        medium: '-6px',
        md: '-6px',
        high: '-12px',
        lg: '-12px',
      };
      styleVars['--card-hover-elevation'] = elevMap[e] || (e.startsWith('-') ? e : `-${e}`);
    }
  }

  // 4. Border Style (Linear Gradient vs Solid vs None)
  const rawBorder = config.borderStyle ?? config.cardBorder;
  if (rawBorder === 'solid') {
    styleVars['--card-border-style'] = 'solid';
    styleVars['--card-border-color'] = 'var(--border)';
  } else if (rawBorder === 'none') {
    styleVars['--card-border-style'] = 'none';
    styleVars['--card-border-color'] = 'transparent';
  } else if (rawBorder === 'subtle') {
    styleVars['--card-border-style'] = 'solid';
    styleVars['--card-border-color'] = 'rgba(255, 255, 255, 0.08)';
  }

  // 5. Hover Effect (Spotlight / Glow / Lift)
  const rawHover = config.hoverEffect ?? config.cardHoverEffect;
  if (rawHover === 'glow') {
    styleVars['--card-hover-shadow'] = '0 0 35px color-mix(in srgb, var(--primary) 35%, transparent)';
  }

  return styleVars;
}

/**
 * 1. منطق التحكم في عرض السيكشن (Section Width Logic)
 */
export function getSectionWidthStyle(config?: any): { maxWidth: string; width: string; margin: string } {
  if (!config) {
    return {
      width: '100%',
      maxWidth: '1280px',
      margin: '0 auto',
    };
  }
  // حالة العرض الكامل 100%
  if (config.fullWidth === true || config.sectionWidth === 'full') {
    return {
      width: '100%',
      maxWidth: '100%',
      margin: '0 auto',
    };
  }
  // حالة العرض المريح / الضيق (مثالي لسكاشن التعريف والرسالة ونماذج الاتصال)
  if (config.sectionWidth === 'narrow') {
    const max = config.maxWidth || 900;
    return {
      width: '100%',
      maxWidth: typeof max === 'number' ? `${max}px` : max,
      margin: '0 auto',
    };
  }
  // حالة العرض المخصص بالبكسل
  if (config.sectionWidth === 'custom' && config.maxWidth) {
    const max = config.maxWidth;
    return {
      width: '100%',
      maxWidth: typeof max === 'number' ? `${max}px` : max,
      margin: '0 auto',
    };
  }
  // العرض القياسي الافتراضي (Standard Container - 1280px)
  return {
    width: '100%',
    maxWidth: config.maxWidth ? (typeof config.maxWidth === 'number' ? `${config.maxWidth}px` : config.maxWidth) : '1280px',
    margin: '0 auto',
  };
}

/**
 * 2. تطبيق الهوامش الأربعة (4-Directional Margins)
 */
export function getSectionMargins(config?: any): {
  marginTop: string;
  marginBottom: string;
  marginRight: string;
  marginLeft: string;
} {
  if (!config) {
    return {
      marginTop: '0px',
      marginBottom: '0px',
      marginRight: 'clamp(1rem, 2.5vw, 2rem)',
      marginLeft: 'clamp(1rem, 2.5vw, 2rem)',
    };
  }

  // الهوامش الرأسية (Top & Bottom)
  const marginTop = config.marginTop !== undefined ? (typeof config.marginTop === 'number' ? `${config.marginTop}px` : config.marginTop) : '0px';
  const marginBottom =
    config.marginBottom !== undefined
      ? (typeof config.marginBottom === 'number' ? `${config.marginBottom}px` : config.marginBottom)
      : config.margin !== undefined
      ? (typeof config.margin === 'number' ? `${config.margin}px` : config.margin)
      : config.hasMargin
      ? '2.5rem'
      : '0px';

  // الهوامش الأفقية (Right & Left)
  // الأولوية: marginRight / marginLeft المباشران -> ثم marginX -> ثم clamp التلقائي إذا كان hasMarginX مفعل
  let marginRight = '0px';
  let marginLeft = '0px';

  if (config.marginRight !== undefined) {
    marginRight = typeof config.marginRight === 'number' ? `${config.marginRight}px` : config.marginRight;
  } else if (config.marginX !== undefined) {
    marginRight = typeof config.marginX === 'number' ? `${config.marginX}px` : config.marginX;
  } else if (config.hasMarginX !== false && !config.fullWidth && config.sectionWidth !== 'full') {
    marginRight = 'clamp(1rem, 2.5vw, 2rem)';
  }

  if (config.marginLeft !== undefined) {
    marginLeft = typeof config.marginLeft === 'number' ? `${config.marginLeft}px` : config.marginLeft;
  } else if (config.marginX !== undefined) {
    marginLeft = typeof config.marginX === 'number' ? `${config.marginX}px` : config.marginX;
  } else if (config.hasMarginX !== false && !config.fullWidth && config.sectionWidth !== 'full') {
    marginLeft = 'clamp(1rem, 2.5vw, 2rem)';
  }

  return {
    marginTop,
    marginBottom,
    marginRight,
    marginLeft,
  };
}

export interface StructuredBlock {
  type: 'special' | 'paragraph';
  title?: string;
  icon?: string;
  text: string;
}

/**
 * Parses and preserves content formatting coming from backend/post/config.
 * Detects special corporate/about sections like Vision, Mission, Goals, Values, etc.
 * and converts them into structured blocks while keeping exact text & whitespace.
 */
export function parseStructuredContent(contentStr: string): StructuredBlock[] {
  if (!contentStr || typeof contentStr !== 'string') return [];
  const normalized = contentStr.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  // Regex to detect start of special sections (الرؤية, الرسالة, الأهداف, القيم, إلخ)
  // Matches at start of string, after a newline, after sentence-ending punctuation (.!?؟) followed by space, or after 2+ spaces
  const sectionSplitRegex = /(?:^|\n|(?<=[.!?؟]\s+)|(?<=\s{2,}))(?=(?:[*#\s]*)(?:الرؤية|لرؤية|رؤيتنا|الرسالة|لرسالة|رسالتنا|الأهداف|أهدافنا|هدفنا|القيم|قيمنا|من نحن|قصتنا|نبذة عنا|كلمة المدير|Vision|Mission|Values|Goals|About)\s*[*#\s]*[:：])/i;

  const rawSegments = normalized.split(sectionSplitRegex).map((s) => s.trim()).filter(Boolean);

  const labelMatcher = /^([*#\s]*(?:الرؤية|لرؤية|رؤيتنا|الرسالة|لرسالة|رسالتنا|الأهداف|أهدافنا|هدفنا|القيم|قيمنا|من نحن|قصتنا|نبذة عنا|كلمة المدير|Vision|Mission|Values|Goals|About)\s*[*#\s]*[:：])\s*([\s\S]*)$/i;

  const getIconForTitle = (title: string): string => {
    const t = title.toLowerCase();
    if (t.includes('رؤي') || t.includes('vision')) return '👁️';
    if (t.includes('رسال') || t.includes('mission')) return '🎯';
    if (t.includes('هدف') || t.includes('أهداف') || t.includes('goal')) return '🚀';
    if (t.includes('قيم') || t.includes('value')) return '💎';
    if (t.includes('من نحن') || t.includes('قصت') || t.includes('نبذة') || t.includes('about')) return '🏢';
    return '✦';
  };

  const cleanLabelTitle = (rawLabel: string): string => {
    let clean = rawLabel.replace(/[*#:_：]/g, '').trim();
    if (clean === 'لرؤية') clean = 'الرؤية';
    if (clean === 'لرسالة') clean = 'الرسالة';
    return clean;
  };

  const blocks: StructuredBlock[] = [];

  for (const segment of rawSegments) {
    const match = segment.match(labelMatcher);
    if (match) {
      const rawLabel = match[1];
      const body = match[2].trim();
      const title = cleanLabelTitle(rawLabel);
      const icon = getIconForTitle(title);
      blocks.push({
        type: 'special',
        title,
        icon,
        text: body,
      });
    } else {
      const paras = segment.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
      for (const p of paras) {
        blocks.push({
          type: 'paragraph',
          text: p,
        });
      }
    }
  }

  return blocks;
}
