"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { getFullImageUrl } from "@/services/api";
import { getSectionHeaderTexts, resolveLocalizedText } from "@/utils/sectionHelpers";
import styles from "./StoreComponents.module.css";

interface ShowcaseTab {
  label?: string | Record<string, string>;
  imageUrl?: string;
  description?: string | Record<string, string>;
  targetType?: "product" | "post" | "custom_url";
  productId?: string;
  postSlug?: string;
  customUrl?: string;
  buttonText?: string | Record<string, string>;
}

interface ShowcaseProps {
  tabs?: ShowcaseTab[];
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  displayMode?: string;
}

export default function Showcase({ tabs, title, description, displayMode = "tabs" }: ShowcaseProps) {
  const { lang } = useApp();
  const [activeTab, setActiveTab] = useState(0);

  const { titleText, descText, hasHeader } = getSectionHeaderTexts({ title, description }, lang);

  const displayTabs = tabs && tabs.length > 0 ? tabs : [];
  if (displayTabs.length === 0) return null;

  const currentTab = displayTabs[activeTab] || displayTabs[0];
  const imageUrl = getFullImageUrl(currentTab.imageUrl);

  const isSlider = displayMode === "slider" || displayMode === "slide" || displayMode === "scroll";

  const nextSlide = () => {
    setActiveTab((prev) => (prev + 1) % displayTabs.length);
  };

  const prevSlide = () => {
    setActiveTab((prev) => (prev - 1 + displayTabs.length) % displayTabs.length);
  };

  const getTabLink = (tab: ShowcaseTab): string | null => {
    if (tab.targetType === "product" && tab.productId) return `/store/${tab.productId}`;
    if (tab.targetType === "post" && tab.postSlug) return `/blog/${tab.postSlug}`;
    if (tab.targetType === "custom_url" && tab.customUrl) return tab.customUrl;
    if (tab.productId) return `/store/${tab.productId}`;
    if (tab.postSlug) return `/blog/${tab.postSlug}`;
    if (tab.customUrl) return tab.customUrl;
    return null;
  };

  const activeHref = getTabLink(currentTab);
  const activeBtnText = resolveLocalizedText(currentTab.buttonText, lang);
  const activeDesc = resolveLocalizedText(currentTab.description, lang);

  return (
    <section className={`${styles.landingSection} animateFadeUp`}>
      {hasHeader && (
        <div className={styles.landingSectionHeader}>
          {titleText && <h2 className={styles.sectionTitle}>{titleText}</h2>}
          {descText && <p className={styles.sectionSubtitle}>{descText}</p>}
        </div>
      )}

      <div className={styles.showcaseWrapper}>
        <div className={styles.tabButtons}>
          {displayTabs.map((tab, index) => (
            <button
              key={index}
              type="button"
              className={`${styles.tabButton} ${activeTab === index ? styles.tabButtonActive : ""}`}
              onClick={() => setActiveTab(index)}
            >
              {resolveLocalizedText(tab.label, lang) || `${lang === "ar" ? "شريحة" : "Slide"} ${index + 1}`}
            </button>
          ))}
        </div>

        <div className={`${styles.showcaseImageWrapper} glassCard attractiveCard`}>
          {imageUrl ? (
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              {activeHref ? (
                <Link href={activeHref} style={{ display: "block", width: "100%", height: "100%" }}>
                  <img
                    key={imageUrl}
                    src={imageUrl}
                    alt={resolveLocalizedText(currentTab.label, lang)}
                    className={styles.showcaseImage}
                    loading="lazy"
                  />
                </Link>
              ) : (
                <img
                  key={imageUrl}
                  src={imageUrl}
                  alt={resolveLocalizedText(currentTab.label, lang)}
                  className={styles.showcaseImage}
                  loading="lazy"
                />
              )}

              {(activeDesc || activeHref) && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "1rem",
                    insetInlineStart: "1rem",
                    insetInlineEnd: "1rem",
                    background: "rgba(15, 23, 42, 0.8)",
                    backdropFilter: "blur(12px)",
                    padding: "1rem 1.25rem",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                    color: "#fff",
                    zIndex: 2,
                  }}
                >
                  {activeDesc && <p style={{ margin: 0, fontSize: "0.95rem" }}>{activeDesc}</p>}
                  {activeHref && (
                    <Link href={activeHref} className="glowButton" style={{ padding: "0.5rem 1.1rem", fontSize: "0.88rem" }}>
                      {activeBtnText ||
                        (currentTab.targetType === "product"
                          ? lang === "ar"
                            ? "🛍️ تصفح المنتج"
                            : "🛍️ View Product"
                          : lang === "ar"
                          ? "📖 اقرأ الدليل الشامل"
                          : "📖 Read Guide")}
                    </Link>
                  )}
                </div>
              )}

              {isSlider && displayTabs.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Previous slide"
                    style={{
                      position: "absolute",
                      top: "50%",
                      insetInlineStart: "1rem",
                      transform: "translateY(-50%)",
                      background: "rgba(0,0,0,0.5)",
                      color: "#fff",
                      border: "none",
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      cursor: "pointer",
                      fontSize: "1.2rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backdropFilter: "blur(4px)",
                      zIndex: 3,
                    }}
                  >
                    {lang === "ar" ? "›" : "‹"}
                  </button>
                  <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next slide"
                    style={{
                      position: "absolute",
                      top: "50%",
                      insetInlineEnd: "1rem",
                      transform: "translateY(-50%)",
                      background: "rgba(0,0,0,0.5)",
                      color: "#fff",
                      border: "none",
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      cursor: "pointer",
                      fontSize: "1.2rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backdropFilter: "blur(4px)",
                      zIndex: 3,
                    }}
                  >
                    {lang === "ar" ? "‹" : "›"}
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className={styles.showcasePlaceholder}>
              <span>🖼️</span>
              <p>{lang === "ar" ? "أضف رابط الصورة من لوحة التحكم" : "Add image URL from admin panel"}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
