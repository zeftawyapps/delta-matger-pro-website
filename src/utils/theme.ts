import { OrgConfig } from '../types';

/**
 * Utility to parse Android/Flutter ARGB color strings (like "0xFFD4AF37")
 * and convert them to standard web hex strings ("#D4AF37").
 */
export const formatColor = (colorStr?: string): string => {
  if (!colorStr) return '';
  
  const cleanStr = colorStr.trim();
  
  if (cleanStr.startsWith('#')) return cleanStr;
  
  if (cleanStr.toUpperCase().startsWith('0X')) {
    if (cleanStr.length === 10) {
      return '#' + cleanStr.slice(4);
    }
    return '#' + cleanStr.slice(2);
  }
  
  if (/^[0-9A-F]{6}$/i.test(cleanStr)) {
    return '#' + cleanStr;
  }
  if (/^[0-9A-F]{8}$/i.test(cleanStr)) {
    return '#' + cleanStr.slice(2);
  }
  
  return cleanStr;
};

/**
 * Injects dynamic CSS variables into the HTML document based on the organization's config.
 * Supports light and dark modes.
 */
export const applyTheme = (themes?: OrgConfig['themes'], isDarkMode: boolean = false): void => {
  const activePalette = isDarkMode ? themes?.dark : themes?.light;
  if (!activePalette) return;

  const styleElement = document.getElementById('dynamic-theme-vars');
  if (!styleElement) return;

  const primary = formatColor(activePalette.primary || '#D4AF37');
  const secondary = formatColor(activePalette.secondary || '#1A2332');
  const accent = formatColor(activePalette.accent || '#ECC951');
  const background = formatColor(activePalette.background || (isDarkMode ? '#1A2332' : '#FAF8F3'));
  const surface = formatColor(activePalette.surface || (isDarkMode ? '#242F3F' : '#FFFFFF'));
  const surfaceVariant = formatColor(activePalette.surfaceVariant || (isDarkMode ? '#2D3847' : '#F5F0E8'));
  const textPrimary = formatColor(activePalette.textPrimary || (isDarkMode ? '#FAF8F3' : '#1A2332'));
  const textSecondary = formatColor(activePalette.textSecondary || (isDarkMode ? '#D4C9B0' : '#5A6779'));
  const textHint = formatColor(activePalette.textHint || '#9CA3AF');
  const textOnPrimary = formatColor(activePalette.textOnPrimary || '#FFFFFF');
  const divider = formatColor(activePalette.divider || (isDarkMode ? '#3D4A5C' : '#E5DCC8'));
  const inputBackground = formatColor(activePalette.inputBackground || (isDarkMode ? '#242F3F' : '#FAF8F3'));
  const inputBorder = formatColor(activePalette.inputBorder || (isDarkMode ? '#3D4A5C' : '#D4C9B0'));
  
  const success = formatColor(activePalette.success || '#4CAF50');
  const error = formatColor(activePalette.error || '#E53935');
  const warning = formatColor(activePalette.warning || '#FFFFB300');
  const info = formatColor(activePalette.info || '#2196F3');

  const cssText = `
    :root {
      --color-primary: ${primary};
      --color-secondary: ${secondary};
      --color-accent: ${accent};
      --color-background: ${background};
      --color-surface: ${surface};
      --color-surface-variant: ${surfaceVariant};
      --color-text-primary: ${textPrimary};
      --color-text-secondary: ${textSecondary};
      --color-text-hint: ${textHint};
      --color-text-on-primary: ${textOnPrimary};
      --color-divider: ${divider};
      --color-input-background: ${inputBackground};
      --color-input-border: ${inputBorder};
      --color-success: ${success};
      --color-error: ${error};
      --color-warning: ${warning};
      --color-info: ${info};
      --color-glass-bg: ${isDarkMode ? 'rgba(36, 47, 63, 0.75)' : 'rgba(255, 255, 255, 0.75)'};
      --color-glass-border: ${isDarkMode ? 'rgba(61, 74, 92, 0.4)' : 'rgba(229, 220, 200, 0.4)'};
      --color-glass-shadow: ${isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(26, 35, 50, 0.05)'};
    }
  `;

  styleElement.textContent = cssText;
};
