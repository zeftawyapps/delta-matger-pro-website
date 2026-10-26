import { IntroSlideConfig } from "@/types";

type Localized = string | Record<string, string> | undefined;

export function resolveIntroLocalized(val: Localized, lang: string): string {
  if (!val) return "";
  if (typeof val === "string") return val.trim();
  const res = val[lang] || val.ar || val.en || "";
  return typeof res === "string" ? res.trim() : "";
}

export interface ClassicHeroChrome {
  badge: string;
  badgeBg?: string;
  badgeTextColor?: string;
  showBadge: boolean;
  buttonText: string;
  buttonLink: string;
  buttonBg?: string;
  buttonTextColor?: string;
  buttonShape?: string;
  showButtonArrow?: boolean;
  showButton: boolean;
  showGlow: boolean;
  useGradientTitle: boolean;
  showImage: boolean;
  imageUrl?: string;
  showPrice: boolean;
  price?: number;
  originalPrice?: number;
  discountLabel?: string;
}

function modeDefaults(
  appMode: string,
  lang: string
): Omit<
  ClassicHeroChrome,
  "showBadge" | "showButton" | "showGlow" | "useGradientTitle" | "showImage" | "showPrice"
> {
  if (appMode === "store") {
    return {
      badge: lang === "ar" ? "عرض خاص لفترة محدودة" : "Limited Time Special",
      buttonText: lang === "ar" ? "اشتري الآن" : "Shop Now",
      buttonLink: "/store/101",
      imageUrl:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
      price: 199.99,
      originalPrice: 249,
      discountLabel: "20% OFF",
    };
  }
  if (appMode === "blog") {
    return {
      badge: lang === "ar" ? "المدونة" : "Blog",
      buttonText: lang === "ar" ? "ابدأ القراءة" : "Start Reading",
      buttonLink: "#featured",
    };
  }
  return {
    badge: lang === "ar" ? "⚡ هجين" : "⚡ Hybrid",
    buttonText: lang === "ar" ? "تصفح المنتجات" : "Browse Shop",
    buttonLink: "#store-sec",
  };
}

export function getClassicHeroChrome(
  config: IntroSlideConfig,
  appMode: string,
  lang: string,
  slideImage?: string,
  slideMeta?: {
    price?: number;
    originalPrice?: number;
    discountLabel?: string;
    link?: string;
    badge?: string;
  }
): ClassicHeroChrome {
  const defaults = modeDefaults(appMode, lang);
  const badgeFromConfig = resolveIntroLocalized(config.badgeText, lang);
  const buttonFromConfig = resolveIntroLocalized(config.buttonText, lang);

  const showImage =
    config.showHeroImage !== false &&
    !!(config.heroImageUrl || slideImage || (appMode === "store" ? defaults.imageUrl : undefined));

  const resolvedButtonText =
    buttonFromConfig || (config.showButton !== false ? (slideMeta?.link ? (lang === "ar" ? "عرض التفاصيل" : "View Details") : defaults.buttonText) : "");

  return {
    badge: badgeFromConfig || slideMeta?.badge || (config.showBadge !== false ? defaults.badge : ""),
    badgeBg: (config.badgeBg && config.badgeBg.trim()) || undefined,
    badgeTextColor: (config.badgeTextColor && config.badgeTextColor.trim()) || undefined,
    showBadge: config.showBadge !== false,
    buttonText: resolvedButtonText,
    buttonLink: (config.buttonLink && config.buttonLink.trim()) || slideMeta?.link || defaults.buttonLink || "#",
    buttonBg: (config.buttonBg && config.buttonBg.trim()) || undefined,
    buttonTextColor: (config.buttonTextColor && config.buttonTextColor.trim()) || undefined,
    buttonShape: config.buttonShape,
    showButtonArrow: config.showButtonArrow === true,
    showButton: config.showButton !== false,
    showGlow: config.showGlow !== false,
    useGradientTitle: config.useGradientTitle !== false,
    showImage,
    imageUrl: config.heroImageUrl || slideImage || defaults.imageUrl,
    showPrice: (slideMeta?.price != null) ? (config.showPrice !== false) : config.showPrice === true,
    price: slideMeta?.price ?? config.price ?? defaults.price,
    originalPrice: slideMeta?.originalPrice ?? config.originalPrice ?? defaults.originalPrice,
    discountLabel: slideMeta?.discountLabel || config.discountLabel || defaults.discountLabel,
  };
}
