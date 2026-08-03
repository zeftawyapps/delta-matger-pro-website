"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { IntroSlideConfig } from "@/types";
import { formatPrice } from "@/utils/currency";
import { getClassicHeroChrome } from "@/utils/introClassicDefaults";
import { withIntroDefaults, getIntroTextStyle, normalizeIntroTextAlign, isGradientColor } from "@/utils/introConfig";
import styles from "./IntroSlides.module.css";

interface NormalizedSlide {
  id: string;
  title: string;
  description: string;
  image?: string;
}

interface IntroSlidesProps {
  config: IntroSlideConfig;
  displayMode?: "grid" | "slide";
  title?: string;
  description?: string;
}

export default function IntroSlides({ config, displayMode, title, description }: IntroSlidesProps) {
  const { posts, lang, appMode, organizationPolicy } = useApp();
  const merged = withIntroDefaults(config);
  const [current, setCurrent] = useState(0);

  const isGridMode = displayMode === "grid";

  // Build slides from "intro" posts; fall back to a single default slide.
  const slides: NormalizedSlide[] = useMemo(() => {
    const introPosts = posts.filter((p) => p.postType === "intro" && p.isActive !== false);

    const mapped = introPosts.map((p) => {
      const title =
        p.introTitle?.[lang] ||
        p.introTitle?.ar ||
        (typeof p.title === "string" ? p.title : p.title?.[lang] || p.title?.ar) ||
        "";
      // Show full content from backend – no truncation
      const description =
        p.introDescription?.[lang] ||
        p.introDescription?.ar ||
        (typeof p.content === "string" ? p.content : p.content?.[lang as any] || p.content?.ar || "") ||
        p.seoDescription?.[lang] ||
        p.seoDescription?.ar ||
        "";
      return {
        id: p.id,
        title,
        description,
        image: p.introImageUrl || p.imageUrl,
      };
    });

    if (mapped.length > 0) return mapped;

    // Default slide when no intro content is configured.
    const defaults: Record<string, NormalizedSlide> = {
      blog: {
        id: "intro-default",
        title:
          lang === "ar"
            ? "اكتشف الأفكار التي تلهمك وتنمي مهاراتك"
            : "Discover Ideas That Inspire Your Journey",
        description:
          lang === "ar"
            ? "مقالات متخصصة يكتبها خبراء لمساعدتك على التفوق."
            : "Insights and tutorials crafted by experts to help you excel.",
      },
      store: {
        id: "intro-default",
        title:
          lang === "ar" ? "ارتقِ بتجربتك الرقمية اليوم" : "Elevate Your Digital Experience",
        description:
          lang === "ar"
            ? "اكتشف تشكيلتنا الحصرية بأحدث التقنيات وأفضل الأسعار."
            : "Discover our exclusive lineup with the latest tech and best prices.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900",
      },
      hybrid: {
        id: "intro-default",
        title:
          lang === "ar"
            ? "تسوق بذكاء واقرأ بشغف في مكان واحد"
            : "Shop Smart & Read Passionately In One Place",
        description:
          lang === "ar"
            ? "أفضل المنتجات مع مقالات شيقة وأدلة تعليمية."
            : "The finest products with captivating stories and guides.",
      },
    };
    return [defaults[appMode] ?? defaults.blog];
  }, [posts, lang, appMode]);

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
  if (merged.backgroundType === "solid") {
    if (merged.customBg && !isCustomBgGradient) {
      background = merged.customBg;
    } else if (merged.customBg && isCustomBgGradient) {
      const firstColor = merged.customBg.match(/#(?:[0-9a-fA-F]{3}){1,2}|rgba?\([^)]+\)/)?.[0];
      background = firstColor || "var(--surface)";
    } else {
      background = "var(--surface)";
    }
  } else {
    background =
      merged.customBg ||
      "linear-gradient(135deg, var(--primary), var(--secondary))";
  }

  // apple_fullscreen renders text OVER a full-bleed image → default white.
  // full_split renders text in a SEPARATE column beside the image → use theme text color.
  const isFullBleedOverlay = merged.displayStyle === "apple_fullscreen";
  const textFallback = isFullBleedOverlay ? "#FFFFFF" : "var(--fg)";
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


  // ---- Display style variants ----
  let inner: React.ReactNode;

  switch (merged.displayStyle) {
    case "minimal_glass": {
      const chrome = getClassicHeroChrome(merged, appMode, lang, slide.image);
      inner = (
        <div className={`${styles.glassWrapper} ${alignClass}`}>
          {slide.image && (
            <img src={slide.image} alt="" className={styles.blurBg} aria-hidden />
          )}
          <div className={`${styles.glassCard} glassCard ${alignClass}`} style={textStyle}>
            {chrome.showBadge && chrome.badge && (
              <span className={styles.classicBadge} style={{ marginBottom: "0.75rem", display: "inline-block" }}>
                {chrome.badge}
              </span>
            )}
            <h1 style={textStyle}>{slide.title}</h1>
            <p style={textStyle}>{slide.description}</p>
            {chrome.showButton && chrome.buttonText && (
              <div className={styles.heroBtns}>
                <Link
                  href={chrome.buttonLink}
                  className="glowButton"
                  style={{
                    backgroundColor: chrome.buttonBg || undefined,
                    color: chrome.buttonTextColor || undefined,
                    borderColor: chrome.buttonBg || undefined,
                  }}
                >
                  {chrome.buttonText}
                </Link>
              </div>
            )}
          </div>
        </div>
      );
      break;
    }

    case "full_split": {
      const chrome = getClassicHeroChrome(merged, appMode, lang, slide.image);
      inner = (
        <div className={styles.splitWrapper}>
          <div className={`${styles.splitText} ${alignClass}`} style={textStyle}>
            {chrome.showBadge && chrome.badge && (
              <span className={styles.classicBadge} style={{ marginBottom: "0.75rem", display: "inline-block" }}>
                {chrome.badge}
              </span>
            )}
            <h1 style={textStyle}>{slide.title}</h1>
            <p style={textStyle}>{slide.description}</p>
            {chrome.showButton && chrome.buttonText && (
              <div className={styles.heroBtns}>
                <Link
                  href={chrome.buttonLink}
                  className="glowButton"
                  style={{
                    backgroundColor: chrome.buttonBg || undefined,
                    color: chrome.buttonTextColor || undefined,
                    borderColor: chrome.buttonBg || undefined,
                  }}
                >
                  {chrome.buttonText}
                </Link>
              </div>
            )}
          </div>
          <div className={styles.splitVisual}>
            {slide.image ? (
              <img src={slide.image} alt={slide.title} />
            ) : (
              <div className={styles.splitPlaceholder} aria-hidden />
            )}
          </div>
        </div>
      );
      break;
    }

    case "classic_centered": {
      const chrome = getClassicHeroChrome(merged, appMode, lang, slide.image);
      const bodyTextStyle = getIntroTextStyle(merged.textColor, textFallback);
      const titleClass = chrome.useGradientTitle
        ? `${styles.classicTitle} ${styles.classicTitleGradient} ${appMode === "store" ? styles.classicTitleStore : ""}`
        : styles.classicTitle;

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
                >
                  {appMode === "store" ? `⚡ ${chrome.badge}` : chrome.badge}
                </span>
              )}
              <h1 className={titleClass} style={chrome.useGradientTitle ? undefined : bodyTextStyle}>
                {slide.title}
              </h1>
              <p className={styles.classicDescription} style={bodyTextStyle}>
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
                    style={{
                      backgroundColor: chrome.buttonBg || undefined,
                      color: chrome.buttonTextColor || undefined,
                      borderColor: chrome.buttonBg || undefined,
                    }}
                  >
                    {chrome.buttonText}
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
      const chrome = getClassicHeroChrome(merged, appMode, lang, slide.image);
      inner = (
        <div className={`${styles.appleWrapper} ${alignClass}`}>
          {slide.image && (
            <img src={slide.image} alt={slide.title} className={styles.appleBg} />
          )}
          <div className={styles.appleOverlay} />
          <div className={`${styles.appleContent} ${alignClass}`} style={textStyle}>
            {chrome.showBadge && chrome.badge && (
              <span className={styles.classicBadge} style={{ marginBottom: "0.75rem", display: "inline-block" }}>
                {chrome.badge}
              </span>
            )}
            <h1 style={textStyle}>{slide.title}</h1>
            <p style={textStyle}>{slide.description}</p>
            {chrome.showButton && chrome.buttonText && (
              <div className={styles.heroBtns}>
                <Link
                  href={chrome.buttonLink}
                  className="glowButton"
                  style={{
                    backgroundColor: chrome.buttonBg || undefined,
                    color: chrome.buttonTextColor || undefined,
                    borderColor: chrome.buttonBg || undefined,
                  }}
                >
                  {chrome.buttonText}
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
