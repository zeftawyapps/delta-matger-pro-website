"use client";

import React, { CSSProperties, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { IntroSlideConfig } from "@/types";
import { formatPrice } from "@/utils/currency";
import { getClassicHeroChrome, resolveIntroLocalized } from "@/utils/introClassicDefaults";
import { withIntroDefaults, getIntroTextStyle, normalizeIntroTextAlign, isGradientColor } from "@/utils/introConfig";
import styles from "./IntroSlides.module.css";

interface NormalizedSlide {
  id: string;
  title: string;
  description: string;
  image?: string;
  price?: number;
  originalPrice?: number;
  discountLabel?: string;
  link?: string;
  badge?: string;
}

interface IntroSlidesProps {
  config: IntroSlideConfig;
  displayMode?: "grid" | "slide";
  title?: string;
  description?: string;
}

function isLightColorOrGradient(colorStr?: string): boolean {
  if (!colorStr) return false;
  const hexMatches = colorStr.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/g);
  if (hexMatches && hexMatches.length > 0) {
    let totalLuminance = 0;
    for (const h of hexMatches) {
      const hex = h.replace("#", "");
      const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.slice(0, 2), 16);
      const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.slice(2, 4), 16);
      const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.slice(4, 6), 16);
      totalLuminance += 0.299 * r + 0.587 * g + 0.114 * b;
    }
    return totalLuminance / hexMatches.length > 170;
  }
  return false;
}

export default function IntroSlides({ config, displayMode, title, description }: IntroSlidesProps) {
  const { posts, products, lang, appMode, organizationPolicy } = useApp();
  const merged = withIntroDefaults(config);
  const [current, setCurrent] = useState(0);

  const isGridMode = displayMode === "grid";

  // Build slides based on content source:
  // - "intro_posts" / "blog": binds to intro posts from blog (postType === "intro")
  // - "joker_products" / "products" / "joker": binds to Joker products from store (isJoker === true)
  // - "auto" (default):
  //    * blog mode -> intro_posts
  //    * store mode -> joker_products (or fallback)
  //    * hybrid mode -> user choice in config, or joker_products if exist, else intro_posts
  const slides: NormalizedSlide[] = useMemo(() => {
    // 1. Map Intro Posts from blog
    const introPosts = posts.filter((p) => p.postType === "intro" && p.isActive !== false);
    const mappedIntroPosts: NormalizedSlide[] = introPosts.map((p) => {
      const title =
        p.introTitle?.[lang] ||
        p.introTitle?.ar ||
        (typeof p.title === "string" ? p.title : p.title?.[lang] || p.title?.ar) ||
        "";
      const rawDesc =
        p.introDescription?.[lang] ||
        p.introDescription?.ar ||
        (typeof p.content === "string" ? p.content : p.content?.[lang as any] || p.content?.ar || "") ||
        p.seoDescription?.[lang] ||
        p.seoDescription?.ar ||
        "";
      const description = rawDesc.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      return {
        id: `post-${p.id}`,
        title,
        description,
        image: p.introImageUrl || p.imageUrl,
        link: p.slug ? `/blog/${p.slug}` : undefined,
      };
    });

    // 2. Map Joker Products from store
    const jokerProducts = (products || []).filter(
      (p) => (p.isJoker === true || p.isSuperJoker === true) && p.isActive !== false
    );
    const mappedJokerProducts: NormalizedSlide[] = jokerProducts.map((p) => {
      const title =
        typeof p.name === "string"
          ? p.name
          : p.name?.[lang] || p.name?.ar || p.name?.en || "";
      const rawDesc =
        typeof p.description === "string"
          ? p.description
          : p.description?.[lang] ||
            p.description?.ar ||
            (typeof p.additionalData?.description === "string"
              ? p.additionalData.description
              : p.additionalData?.description?.[lang as any] || "") ||
            "";
      const description = rawDesc.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      const image = p.imageUrl || p.imageUrls?.[0] || p.images?.[0];
      const originalPrice = p.oldPrice && p.oldPrice > p.price ? p.oldPrice : undefined;
      const discountLabel = p.discount
        ? `${p.discount}% OFF`
        : originalPrice
          ? `${Math.round(((originalPrice - p.price) / originalPrice) * 100)}% OFF`
          : undefined;

      return {
        id: `product-${p.id}`,
        title,
        description,
        image,
        price: p.price,
        originalPrice,
        discountLabel,
        link: `/store/${p.id}`,
        badge: lang === "ar" ? "منتج مميز" : "Featured",
      };
    });

    // 3. Resolve target source
    const rawSource = (merged.slideSource || merged.contentSource || "auto").toLowerCase().trim();
    let resolvedSlides: NormalizedSlide[] = [];

    if (rawSource === "custom" || rawSource === "default" || rawSource === "fallback") {
      resolvedSlides = [];
    } else if (rawSource === "joker_products" || rawSource === "products" || rawSource === "joker") {
      resolvedSlides = mappedJokerProducts;
    } else if (rawSource === "intro_posts" || rawSource === "posts" || rawSource === "blog") {
      resolvedSlides = mappedIntroPosts;
    } else {
      // "auto" resolution by mode:
      if (appMode === "store") {
        resolvedSlides = mappedJokerProducts.length > 0 ? mappedJokerProducts : mappedIntroPosts;
      } else if (appMode === "blog") {
        resolvedSlides = mappedIntroPosts;
      } else {
        // hybrid mode:
        // By default, if joker products exist, bind to joker products; if not, bind to intro posts
        resolvedSlides = mappedJokerProducts.length > 0 ? mappedJokerProducts : mappedIntroPosts;
      }
    }

    if (resolvedSlides.length > 0) return resolvedSlides;

    const customTitle = resolveIntroLocalized(merged.fallbackTitle, lang);
    const customDesc = resolveIntroLocalized(merged.fallbackDescription, lang);

    // Default slide when no intro content is configured (respects admin custom decorative text).
    const defaults: Record<string, NormalizedSlide> = {
      blog: {
        id: "intro-default",
        title:
          customTitle ||
          (lang === "ar"
            ? "اكتشف الأفكار التي تلهمك وتنمي مهاراتك"
            : "Discover Ideas That Inspire Your Journey"),
        description:
          customDesc ||
          (lang === "ar"
            ? "مقالات متخصصة يكتبها خبراء لمساعدتك على التفوق."
            : "Insights and tutorials crafted by experts to help you excel."),
      },
      store: {
        id: "intro-default",
        title:
          customTitle ||
          (lang === "ar" ? "ارتقِ بتجربتك الرقمية اليوم" : "Elevate Your Digital Experience"),
        description:
          customDesc ||
          (lang === "ar"
            ? "اكتشف تشكيلتنا الحصرية بأحدث التقنيات وأفضل الأسعار."
            : "Discover our exclusive lineup with the latest tech and best prices."),
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900",
      },
      hybrid: {
        id: "intro-default",
        title:
          customTitle ||
          (lang === "ar"
            ? "تسوق بذكاء واقرأ بشغف في مكان واحد"
            : "Shop Smart & Read Passionately In One Place"),
        description:
          customDesc ||
          (lang === "ar"
            ? "أفضل المنتجات مع مقالات شيقة وأدلة تعليمية."
            : "The finest products with captivating stories and guides."),
      },
    };
    return [defaults[appMode] ?? defaults.blog];
  }, [posts, products, lang, appMode, merged.slideSource, merged.contentSource, merged.fallbackTitle, merged.fallbackDescription]);

  const slideCount = slides.length;

  // Clamp index when the slide set changes.
  useEffect(() => {
    setCurrent((c) => (c >= slideCount ? 0 : c));
  }, [slideCount]);

  // Auto-play timer – only in slide mode.
  useEffect(() => {
    if (isGridMode || !merged.autoPlay || slideCount <= 1) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slideCount);
    }, merged.duration);
    return () => clearInterval(timer);
  }, [isGridMode, merged.autoPlay, merged.duration, slideCount]);

  const isCustomBgGradient = isGradientColor(merged.customBg);
  let background: string;
  if (isCustomBgGradient) {
    background = merged.customBg!;
  } else if (merged.backgroundType === "gradient") {
    background =
      merged.customBg ||
      "linear-gradient(135deg, #100C1C, #1A2332)";
  } else {
    background =
      merged.customBg ||
      (appMode === "hybrid"
        ? "linear-gradient(135deg, #100C1C, #1A2332)"
        : "var(--surface)");
  }

  const isLightBg = isLightColorOrGradient(background);
  const isFullBleedWithImage =
    merged.displayStyle === "apple_fullscreen" &&
    Boolean(slides[current]?.image || merged.heroImageUrl);
  const textFallback = isFullBleedWithImage
    ? "#FFFFFF"
    : isLightBg
      ? "var(--fg)"
      : "#FFFFFF";
  const textStyle = getIntroTextStyle(merged.textColor, textFallback);

  const goTo = (i: number) => setCurrent(((i % slideCount) + slideCount) % slideCount);

  const textAlign = normalizeIntroTextAlign(merged.textAlign, merged.displayStyle);
  const alignClass =
    textAlign === "center"
      ? styles.alignCenter
      : textAlign === "end"
        ? styles.alignEnd
        : styles.alignStart;

  // ────────────────────────────────────────────────────────────
  // GRID MODE: show all slides as cards in a 2-column grid
  // ────────────────────────────────────────────────────────────
  if (isGridMode) {
    return (
      <section className={`${styles.gridSection} animateFadeUp`} dir={lang === "ar" ? "rtl" : "ltr"}>
        {(title || description) && (
          <div className={styles.introSectionHeader}>
            {title && <h2 className={styles.introSectionTitle}>{title}</h2>}
            {description && <p className={styles.introSectionSubtitle}>{description}</p>}
          </div>
        )}
        <div className={styles.slidesGrid}>
          {slides.map((slide) => (
            <div key={slide.id} className={`${styles.gridCard} glassCard`}>
              {slide.image && (
                <div className={styles.gridCardImg}>
                  <img src={slide.image} alt={slide.title} />
                </div>
              )}
              <div className={styles.gridCardBody}>
                <h2 className={styles.gridCardTitle} style={textStyle}>{slide.title}</h2>
                <p className={styles.gridCardDesc} style={textStyle}>{slide.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ────────────────────────────────────────────────────────────
  // SLIDE MODE: one slide at a time with navigation
  // ────────────────────────────────────────────────────────────
  const slide = slides[Math.min(current, slideCount - 1)];

  const renderIndicators = () => {
    if (merged.indicatorType === "none" || slideCount <= 1) return null;
    return (
      <div className={styles.indicators}>
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`${
              merged.indicatorType === "pills" ? styles.pill : styles.dot
            } ${i === current ? styles.activeIndicator : ""}`}
          />
        ))}
      </div>
    );
  };

  // Navigation arrows (always shown in slide mode when >1 slide)
  const renderArrows = () => {
    if (slideCount <= 1) return null;
    return (
      <>
        <button
          type="button"
          aria-label="Previous slide"
          className={`${styles.navArrow} ${styles.navPrev}`}
          onClick={() => goTo(current - 1)}
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Next slide"
          className={`${styles.navArrow} ${styles.navNext}`}
          onClick={() => goTo(current + 1)}
        >
          ›
        </button>
      </>
    );
  };


  // User custom text color or gradient
  const hasCustomTextColor = Boolean(merged.textColor && merged.textColor.trim());
  const isCustomTextGradient = isGradientColor(merged.textColor);

  // If user provided custom textColor (solid or gradient), ALWAYS honor it!
  // Fall back to theme gradient (.classicTitleGradient) ONLY when textColor is unset and useGradientTitle is true.
  const useThemeDefaultGradient = !hasCustomTextColor && (merged.useGradientTitle !== false);

  const titleClass = `${styles.classicTitle} ${
    useThemeDefaultGradient
      ? `${isLightBg && !isFullBleedWithImage ? styles.classicTitleGradientLight : styles.classicTitleGradient} ${appMode === "store" ? styles.classicTitleStore : ""}`
      : ""
  }`.trim();

  const titleStyle: CSSProperties | undefined = useThemeDefaultGradient
    ? undefined
    : textStyle;

  const descStyle: CSSProperties = isCustomTextGradient
    ? { color: textFallback, opacity: 0.92 }
    : textStyle;

  function getHeroButtonStyle(c: {
    buttonBg?: string;
    buttonBackgroundType?: string;
    buttonTextColor?: string;
    buttonShape?: string;
  }): CSSProperties {
    let rawBg = c.buttonBg?.trim();
    let textColor = c.buttonTextColor?.trim();

    // AUTO-TRANSFER: If buttonTextColor has a gradient, transfer it to rawBg!
    if (isGradientColor(textColor)) {
      if (!isGradientColor(rawBg)) {
        rawBg = textColor;
      }
      textColor = "#FFFFFF";
    }

    if (rawBg && (c.buttonBackgroundType === "gradient" || rawBg.includes(",")) && !isGradientColor(rawBg)) {
      rawBg = rawBg.includes(",")
        ? `linear-gradient(135deg, ${rawBg})`
        : `linear-gradient(135deg, ${rawBg}, var(--secondary))`;
    }

    const isBgGradient = isGradientColor(rawBg);
    const s: CSSProperties = {};

    if (rawBg) {
      s.background = rawBg;
      if (isBgGradient) {
        s.backgroundImage = rawBg;
        s.border = "none";
      } else {
        s.backgroundColor = rawBg;
        s.backgroundImage = "none";
        s.borderColor = rawBg;
      }
    }

    // Button Shape (configurable via webconfig)
    if (c.buttonShape === "pill") {
      s.borderRadius = "9999px";
    } else if (c.buttonShape === "square") {
      s.borderRadius = "0px";
    } else if (c.buttonShape === "soft") {
      s.borderRadius = "16px";
    } else if (c.buttonShape === "rounded_rect") {
      s.borderRadius = "var(--radius-sm, 8px)";
    }

    // Button text color must ALWAYS be a clean readable solid color (never clipped to text on button container!)
    const finalTextColor = textColor || "#FFFFFF";
    s.color = finalTextColor;
    s.WebkitTextFillColor = finalTextColor;

    return s;
  }

  function getHeroBadgeStyle(c: { badgeBg?: string; badgeTextColor?: string }): CSSProperties {
    const s: CSSProperties = {
      marginBottom: "0.75rem",
      display: "inline-block",
    };

    if (c.badgeBg) {
      const isBgGradient = isGradientColor(c.badgeBg);
      s.background = c.badgeBg;
      s.backgroundColor = c.badgeBg;
      s.backgroundImage = isBgGradient ? c.badgeBg : "none";
      s.borderColor = c.badgeBg;
    }

    if (c.badgeTextColor) {
      s.color = c.badgeTextColor;
      s.WebkitTextFillColor = c.badgeTextColor;
    }

    return s;
  }

  // ---- Display style variants ----
  let inner: React.ReactNode;

  switch (merged.displayStyle) {
    case "minimal_glass": {
      const chrome = getClassicHeroChrome(merged, appMode, lang, slide.image, slide);
      const bgImg = chrome.showImage ? (slide.image || chrome.imageUrl) : undefined;

      inner = (
        <div className={`${styles.glassWrapper} ${alignClass}`}>
          {chrome.showGlow && (
            <div
              className={`${styles.classicHeroGlow} ${appMode === "store" ? styles.classicHeroGlowStore : ""}`}
              aria-hidden
            />
          )}
          {bgImg && (
            <img src={bgImg} alt="" className={styles.blurBg} aria-hidden />
          )}
          <div className={`${styles.glassCard} glassCard ${alignClass}`}>
            {chrome.showBadge && chrome.badge && (
              <span className={`${styles.classicBadge} ${appMode === "store" ? styles.classicBadgeStore : ""}`} style={getHeroBadgeStyle(chrome)}>
                {chrome.badge}
              </span>
            )}
            <h1 className={titleClass} style={titleStyle}>{slide.title}</h1>
            <p style={descStyle}>{slide.description}</p>
            {chrome.showPrice && chrome.price != null && (
              <div className={styles.classicPriceRow}>
                {chrome.originalPrice != null && (
                  <span className={styles.classicOriginalPrice}>
                    {formatPrice(chrome.originalPrice, organizationPolicy?.logistics?.currency, lang)}
                  </span>
                )}
                <span className={styles.classicActivePrice}>
                  {formatPrice(chrome.price, organizationPolicy?.logistics?.currency, lang)}
                </span>
                {chrome.discountLabel && (
                  <span className={styles.classicDiscountBadge}>{chrome.discountLabel}</span>
                )}
              </div>
            )}
            {chrome.showButton && chrome.buttonText && (
              <div className={styles.heroBtns}>
                <Link
                  href={chrome.buttonLink}
                  className="glowButton"
                  style={getHeroButtonStyle({ ...chrome, buttonBackgroundType: merged.buttonBackgroundType })}
                >
                  <span>{chrome.buttonText}</span>
                  {chrome.showButtonArrow && (
                    <span className={styles.heroBtnArrow} aria-hidden>
                      {lang === "ar" ? "←" : "→"}
                    </span>
                  )}
                </Link>
              </div>
            )}
          </div>
        </div>
      );
      break;
    }

    case "full_split": {
      const chrome = getClassicHeroChrome(merged, appMode, lang, slide.image, slide);
      const visualImg = chrome.showImage ? (slide.image || chrome.imageUrl) : undefined;

      inner = (
        <div className={styles.splitWrapper}>
          {chrome.showGlow && (
            <div
              className={`${styles.classicHeroGlow} ${appMode === "store" ? styles.classicHeroGlowStore : ""}`}
              aria-hidden
            />
          )}
          <div className={`${styles.splitText} ${alignClass}`}>
            {chrome.showBadge && chrome.badge && (
              <span className={`${styles.classicBadge} ${appMode === "store" ? styles.classicBadgeStore : ""}`} style={getHeroBadgeStyle(chrome)}>
                {chrome.badge}
              </span>
            )}
            <h1 className={titleClass} style={titleStyle}>{slide.title}</h1>
            <p style={descStyle}>{slide.description}</p>
            {chrome.showPrice && chrome.price != null && (
              <div className={styles.classicPriceRow}>
                {chrome.originalPrice != null && (
                  <span className={styles.classicOriginalPrice}>
                    {formatPrice(chrome.originalPrice, organizationPolicy?.logistics?.currency, lang)}
                  </span>
                )}
                <span className={styles.classicActivePrice}>
                  {formatPrice(chrome.price, organizationPolicy?.logistics?.currency, lang)}
                </span>
                {chrome.discountLabel && (
                  <span className={styles.classicDiscountBadge}>{chrome.discountLabel}</span>
                )}
              </div>
            )}
            {chrome.showButton && chrome.buttonText && (
              <div className={styles.heroBtns}>
                <Link
                  href={chrome.buttonLink}
                  className="glowButton"
                  style={getHeroButtonStyle({ ...chrome, buttonBackgroundType: merged.buttonBackgroundType })}
                >
                  <span>{chrome.buttonText}</span>
                  {chrome.showButtonArrow && (
                    <span className={styles.heroBtnArrow} aria-hidden>
                      {lang === "ar" ? "←" : "→"}
                    </span>
                  )}
                </Link>
              </div>
            )}
          </div>
          <div className={styles.splitVisual}>
            {visualImg ? (
              <img src={visualImg} alt={slide.title} />
            ) : (
              <div className={styles.splitPlaceholder} aria-hidden />
            )}
          </div>
        </div>
      );
      break;
    }

    case "classic_centered": {
      const chrome = getClassicHeroChrome(merged, appMode, lang, slide.image, slide);

      inner = (
        <div className={styles.classicWrapper}>
          {chrome.showGlow && (
            <div
              className={`${styles.classicHeroGlow} ${appMode === "store" ? styles.classicHeroGlowStore : ""}`}
              aria-hidden
            />
          )}
          <div
            className={`${styles.classicGrid} ${chrome.showImage ? styles.classicGridWithVisual : ""} ${!chrome.showImage ? alignClass : ""}`}
          >
            <div className={`${styles.classicContent} ${alignClass}`}>
              {chrome.showBadge && chrome.badge && (
                <span
                  className={`${styles.classicBadge} ${appMode === "store" ? styles.classicBadgeStore : ""}`}
                  style={getHeroBadgeStyle(chrome)}
                >
                  {appMode === "store" ? `⚡ ${chrome.badge}` : chrome.badge}
                </span>
              )}
              <h1 className={titleClass} style={titleStyle}>
                {slide.title}
              </h1>
              <p className={styles.classicDescription} style={descStyle}>
                {slide.description}
              </p>
              {chrome.showPrice && chrome.price != null && (
                <div className={styles.classicPriceRow}>
                  {chrome.originalPrice != null && (
                    <span className={styles.classicOriginalPrice}>
                      {formatPrice(chrome.originalPrice, organizationPolicy?.logistics?.currency, lang)}
                    </span>
                  )}
                  <span className={styles.classicActivePrice}>
                    {formatPrice(chrome.price, organizationPolicy?.logistics?.currency, lang)}
                  </span>
                  {chrome.discountLabel && (
                    <span className={styles.classicDiscountBadge}>{chrome.discountLabel}</span>
                  )}
                </div>
              )}
              {chrome.showButton && chrome.buttonText && (
                <div className={styles.heroBtns}>
                  <Link
                    href={chrome.buttonLink}
                    className="glowButton"
                    style={getHeroButtonStyle({ ...chrome, buttonBackgroundType: merged.buttonBackgroundType })}
                  >
                    <span>{chrome.buttonText}</span>
                    {chrome.showButtonArrow && (
                      <span className={styles.heroBtnArrow} aria-hidden>
                        {lang === "ar" ? "←" : "→"}
                      </span>
                    )}
                  </Link>
                </div>
              )}
            </div>
            {chrome.showImage && chrome.imageUrl && (
              <div className={styles.classicVisual}>
                <div className={`${styles.classicVisualCard} glassCard`}>
                  <img src={chrome.imageUrl} alt={slide.title} className={styles.classicVisualImg} />
                </div>
              </div>
            )}
          </div>
        </div>
      );
      break;
    }

    case "apple_fullscreen":
    default: {
      const chrome = getClassicHeroChrome(merged, appMode, lang, slide.image, slide);
      const bgImg = chrome.showImage ? (slide.image || chrome.imageUrl) : undefined;
      const hasBgImage = Boolean(bgImg);

      inner = (
        <div className={`${styles.appleWrapper} ${alignClass}`}>
          {chrome.showGlow && (
            <div
              className={`${styles.classicHeroGlow} ${appMode === "store" ? styles.classicHeroGlowStore : ""}`}
              aria-hidden
            />
          )}
          {bgImg && (
            <>
              <img src={bgImg} alt={slide.title} className={styles.appleBg} />
              <div className={styles.appleOverlay} />
            </>
          )}
          <div className={`${styles.appleContent} ${alignClass}`}>
            {chrome.showBadge && chrome.badge && (
              <span className={`${styles.classicBadge} ${appMode === "store" ? styles.classicBadgeStore : ""}`} style={getHeroBadgeStyle(chrome)}>
                {chrome.badge}
              </span>
            )}
            <h1 className={titleClass} style={titleStyle}>{slide.title}</h1>
            <p style={descStyle}>{slide.description}</p>
            {chrome.showPrice && chrome.price != null && (
              <div className={styles.classicPriceRow}>
                {chrome.originalPrice != null && (
                  <span className={styles.classicOriginalPrice}>
                    {formatPrice(chrome.originalPrice, organizationPolicy?.logistics?.currency, lang)}
                  </span>
                )}
                <span className={styles.classicActivePrice}>
                  {formatPrice(chrome.price, organizationPolicy?.logistics?.currency, lang)}
                </span>
                {chrome.discountLabel && (
                  <span className={styles.classicDiscountBadge}>{chrome.discountLabel}</span>
                )}
              </div>
            )}
            {chrome.showButton && chrome.buttonText && (
              <div className={styles.heroBtns}>
                <Link
                  href={chrome.buttonLink}
                  className="glowButton"
                  style={getHeroButtonStyle({ ...chrome, buttonBackgroundType: merged.buttonBackgroundType })}
                >
                  <span>{chrome.buttonText}</span>
                  {chrome.showButtonArrow && (
                    <span className={styles.heroBtnArrow} aria-hidden>
                      {lang === "ar" ? "←" : "→"}
                    </span>
                  )}
                </Link>
              </div>
            )}
          </div>
        </div>
      );
      break;
    }
  }

  const animationClass = styles[`anim_${merged.slideAnimation || "fade"}`] || styles.anim_fade;

  return (
    <section
      className={`${styles.intro} ${styles[merged.displayStyle]} animateFadeUp`}
      style={{ background }}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div key={`${slide.id}_${current}`} className={`${styles.slideContentWrapper} ${animationClass}`}>
        {inner}
      </div>
      {renderArrows()}
      {renderIndicators()}
    </section>
  );
}
