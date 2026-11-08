"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { getFullImageUrl } from "@/services/api";
import { formatPrice } from "@/utils/currency";
import { getSectionHeaderTexts, resolveLocalizedText } from "@/utils/sectionHelpers";
import { SystemShowcaseItem, SystemShowcaseHotspot } from "@/types";
import SectionHeader from "@/components/common/SectionHeader";
import styles from "./Sections.module.css";

interface SystemScreensShowcaseProps {
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  config?: Record<string, any>;
}

export default function SystemScreensShowcase({
  title,
  description,
  config = {},
}: SystemScreensShowcaseProps) {
  const { lang, products, posts, addToCart, organizationPolicy } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  const { titleText, descText, hasHeader } = getSectionHeaderTexts({ title, description }, lang);
  const screens: SystemShowcaseItem[] = Array.isArray(config.screens)
    ? config.screens
    : Array.isArray(config.tabs)
    ? config.tabs
    : [];

  if (screens.length === 0) return null;

  const currentScreen = screens[activeIndex] || screens[0];
  const imgUrl = getFullImageUrl(currentScreen.imageUrl);
  const screenTitle = resolveLocalizedText(currentScreen.tabLabel || currentScreen.label, lang);
  const screenDesc = resolveLocalizedText(currentScreen.description, lang);
  const currency = organizationPolicy?.logistics?.currency;

  // Resolve linked product or blog post
  const linkedProduct =
    currentScreen.productId
      ? products.find((p) => String(p.id) === String(currentScreen.productId))
      : undefined;

  const linkedPost =
    currentScreen.postSlug
      ? posts.find((p) => p.slug === currentScreen.postSlug || String(p.id) === String(currentScreen.postSlug))
      : undefined;

  const getTargetLink = (item: {
    targetType?: string;
    productId?: string;
    postSlug?: string;
    customUrl?: string;
  }) => {
    if (item.targetType === "product" && item.productId) return `/store/${item.productId}`;
    if (item.targetType === "post" && item.postSlug) return `/blog/${item.postSlug}`;
    if (item.targetType === "custom_url" && item.customUrl) return item.customUrl;
    if (item.productId) return `/store/${item.productId}`;
    if (item.postSlug) return `/blog/${item.postSlug}`;
    if (item.customUrl) return item.customUrl;
    return "/store";
  };

  const mainHref = getTargetLink(currentScreen);
  const mainBtnText =
    resolveLocalizedText(currentScreen.buttonText || currentScreen.actionButton?.text, lang) ||
    (currentScreen.targetType === "product"
      ? lang === "ar"
        ? "🛍️ تصفح المنتج"
        : "🛍️ View Product"
      : lang === "ar"
      ? "📖 اقرأ الدليل التعليمي"
      : "📖 Read Guide");

  return (
    <section className={`${styles.sectionContainer} animateFadeUp`}>
      <SectionHeader
        title={titleText}
        subtitle={descText}
        config={config}
      />

      {/* Interactive Tabs Bar */}
      {screens.length > 1 && (
        <div className={styles.screensTabsBar}>
          {screens.map((scr, idx) => (
            <button
              key={scr.id || idx}
              type="button"
              onClick={() => {
                setActiveIndex(idx);
                setActiveHotspot(null);
              }}
              className={`${styles.screenTabPill} ${
                activeIndex === idx ? styles.screenTabPillActive : ""
              }`}
            >
              {resolveLocalizedText(scr.tabLabel || scr.label, lang) ||
                `${lang === "ar" ? "شاشة" : "Screen"} ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      <div className={styles.showcaseSplitLayout}>
        {/* Realistic Device Chrome Frame */}
        <div className={styles.deviceBrowserFrame}>
          <div className={styles.browserChromeHeader}>
            <div className={styles.browserDots}>
              <span className={styles.browserDotRed} />
              <span className={styles.browserDotYellow} />
              <span className={styles.browserDotGreen} />
            </div>
            <div className={styles.browserAddressBar}>
              🔒 matger.pro/{currentScreen.postSlug || currentScreen.productId || "showcase"}
            </div>
          </div>

          <div className={styles.screenCanvas}>
            {imgUrl ? (
              <img src={imgUrl} alt={screenTitle} className={styles.screenImage} />
            ) : (
              <div style={{ padding: "3rem", textAlign: "center", opacity: 0.7 }}>
                <span style={{ fontSize: "2.5rem" }}>🖥️</span>
                <p>{screenTitle}</p>
              </div>
            )}

            {/* Interactive Pulsing Hotspots */}
            {Array.isArray(currentScreen.hotspots) &&
              currentScreen.hotspots.map((spot: SystemShowcaseHotspot, sIdx: number) => {
                const spotHref = getTargetLink(spot);
                const spotTitle = resolveLocalizedText(spot.title, lang);
                const isOpen = activeHotspot === sIdx;
                return (
                  <div
                    key={sIdx}
                    className={styles.hotspotPin}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    onClick={() => setActiveHotspot(isOpen ? null : sIdx)}
                    onMouseEnter={() => setActiveHotspot(sIdx)}
                  >
                    +
                    {isOpen && (
                      <div className={styles.hotspotPopover}>
                        <div style={{ fontWeight: 700, marginBottom: "0.35rem" }}>{spotTitle}</div>
                        <Link
                          href={spotHref}
                          style={{ color: "var(--accent)", textDecoration: "underline" }}
                        >
                          {spot.targetType === "product"
                            ? lang === "ar"
                              ? "عرض المنتج ←"
                              : "View Product →"
                            : lang === "ar"
                            ? "اقرأ المقال ←"
                            : "Read Article →"}
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Linked Conversion Panel (Product or Blog Post Card) */}
        <div className={`${styles.linkedConversionPanel} glassCard attractiveCard`}>
          <span className={styles.trustedBadge}>
            {currentScreen.targetType === "product"
              ? lang === "ar"
                ? "🛍️ منتج مرتبط"
                : "🛍️ Linked Product"
              : currentScreen.targetType === "post"
              ? lang === "ar"
                ? "📖 دليل تعليمي"
                : "📖 Linked Guide"
              : lang === "ar"
              ? "✨ استعراض تفاعلي"
              : "✨ Interactive Showcase"}
          </span>

          {screenTitle && <h3 style={{ margin: 0 }}>{screenTitle}</h3>}
          {screenDesc && <p style={{ margin: 0, opacity: 0.8 }}>{screenDesc}</p>}

          {linkedProduct && (
            <div
              style={{
                padding: "1rem",
                borderRadius: "14px",
                background: "color-mix(in srgb, var(--primary) 8%, transparent)",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: "0.65rem",
              }}
            >
              <strong>{resolveLocalizedText(linkedProduct.name, lang)}</strong>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary)" }}>
                  {formatPrice(linkedProduct.price, currency, lang)}
                </span>
                {linkedProduct.oldPrice && linkedProduct.oldPrice > linkedProduct.price && (
                  <del style={{ opacity: 0.55, fontSize: "0.9rem" }}>
                    {formatPrice(linkedProduct.oldPrice, currency, lang)}
                  </del>
                )}
              </div>
              <button
                type="button"
                onClick={() => addToCart(linkedProduct, 1)}
                className="glowButton"
                style={{ width: "100%", justifyContent: "center" }}
              >
                🛒 {lang === "ar" ? "أضف للسلة فوراً" : "Add to Cart"}
              </button>
            </div>
          )}

          {linkedPost && (
            <div
              style={{
                padding: "1rem",
                borderRadius: "14px",
                background: "color-mix(in srgb, var(--secondary) 8%, transparent)",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <strong>{resolveLocalizedText(linkedPost.title, lang)}</strong>
              <span style={{ fontSize: "0.82rem", opacity: 0.7 }}>
                ⏱️ {lang === "ar" ? "5 دقائق قراءة" : "5 min read"}
              </span>
            </div>
          )}

          <Link
            href={mainHref}
            className="glowButton"
            style={{ justifyContent: "center", width: "100%" }}
          >
            {mainBtnText}
          </Link>
        </div>
      </div>
    </section>
  );
}

