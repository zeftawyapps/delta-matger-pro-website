import { IntroSlideConfig } from "@/types";

type Localized = string | Record<string, string> | undefined;

export function resolveIntroLocalized(val: Localized, lang: string): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[lang] || val.ar || val.en || "";
}

export interface ClassicHeroChrome {
  badge: string;
  showBadge: boolean;
  buttonText: string;
  buttonLink: string;
  buttonBg?: string;
  buttonTextColor?: string;
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
  slideImage?: string
): ClassicHeroChrome {
  const defaults = modeDefaults(appMode, lang);
  const badgeFromConfig = resolveIntroLocalized(config.badgeText, lang);
  const buttonFromConfig = resolveIntroLocalized(config.buttonText, lang);

  const showImage =
    config.showHeroImage !== false &&
    !!(config.heroImageUrl || slideImage || (appMode === "store" ? defaults.imageUrl : undefined));

  return {
    badge: badgeFromConfig || (config.showBadge !== false ? defaults.badge : ""),
    showBadge: config.showBadge !== false,
    buttonText: buttonFromConfig || (config.showButton !== false ? defaults.buttonText : ""),
    buttonLink: config.buttonLink || defaults.buttonLink || "#",
    buttonBg: config.buttonBg,
    buttonTextColor: config.buttonTextColor,
    showButton: config.showButton !== false,
    showGlow: config.showGlow !== false,
    useGradientTitle: config.useGradientTitle !== false,
    showImage,
    imageUrl: config.heroImageUrl || slideImage || defaults.imageUrl,
    showPrice: config.showPrice === true,
    price: config.price ?? defaults.price,
    originalPrice: config.originalPrice ?? defaults.originalPrice,
    discountLabel: config.discountLabel || defaults.discountLabel,
  };
}
