"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { getFullImageUrl } from "@/services/api";
import { getSectionHeaderTexts, resolveLocalizedText } from "@/utils/sectionHelpers";
import styles from "./Sections.module.css";

interface HeroSaasInteractiveProps {
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  config?: Record<string, any>;
}

export default function HeroSaasInteractive({
  title,
  description,
  config = {},
}: HeroSaasInteractiveProps) {
  const { lang, config: orgConfig } = useApp();
  const [inputVal, setInputVal] = useState("");
  const { titleText, descText } = getSectionHeaderTexts({ title, description }, lang);

  const trustedBadge = resolveLocalizedText(config.trustedBadge, lang);
  const headline = resolveLocalizedText(config.headline, lang) || titleText;
  const highlightWord = resolveLocalizedText(config.highlightWord, lang);
  const subheadline = resolveLocalizedText(config.subheadline, lang) || descText;
  const quickInput = config.quickInput || {};
  const floatingStats = Array.isArray(config.floatingStats) ? config.floatingStats : [];
  const imageUrl = config.imageUrl ? getFullImageUrl(config.imageUrl) : "";

  const targetHref =
    config.targetType === "product" && config.productId
      ? `/store/${config.productId}`
      : config.targetType === "post" && config.postSlug
      ? `/blog/${config.postSlug}`
      : config.buttonLink || "/store";

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const waPhone = (
      orgConfig?.socialMedia?.whatsapp ||
      config.whatsappNumber ||
      ""
    ).replace(/\D/g, "");
    if (waPhone && inputVal.trim()) {
      const text = encodeURIComponent(
        lang === "ar"
          ? `مرحباً، أرغب في البدء والتجربة الفورية. رقمي/متجري: ${inputVal.trim()}`
          : `Hello, I want to start my trial. My info: ${inputVal.trim()}`
      );
      window.open(`https://wa.me/${waPhone}?text=${text}`, "_blank");
    } else if (targetHref) {
      window.location.href = targetHref;
    }
  };

  return (
    <section className={`${styles.sectionContainer} animateFadeUp`}>
      <div className={styles.heroSaasGrid}>
        <div className={styles.heroPromoCol}>
          {trustedBadge && <span className={styles.trustedBadge}>✨ {trustedBadge}</span>}

          {(headline || highlightWord) && (
            <h1 className={styles.heroHeadline}>
              {headline}{" "}
              {highlightWord && (
                <span className={styles.gradientHighlight}>{highlightWord}</span>
              )}
            </h1>
          )}

          {subheadline && <p className={styles.heroSubheadline}>{subheadline}</p>}

          {quickInput?.enabled !== false ? (
            <form onSubmit={handleQuickSubmit} className={styles.leadCaptureForm}>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={
                  resolveLocalizedText(quickInput.placeholder, lang) ||
                  (lang === "ar"
                    ? "أدخل رقم هاتفك للتجربة الفورية"
                    : "Enter your phone for instant demo")
                }
                className={styles.leadInput}
              />
              <button type="submit" className="glowButton">
                {resolveLocalizedText(quickInput.buttonText || config.buttonText, lang) ||
                  (lang === "ar" ? "ابدأ الآن" : "Start Now")}
              </button>
            </form>
          ) : (
            config.buttonText && (
              <Link href={targetHref} className="glowButton">
                {resolveLocalizedText(config.buttonText, lang)}
              </Link>
            )
          )}
        </div>

        <div className={styles.heroMockupCol}>
          <div className={`${styles.phoneMockupShell} attractiveCard`}>
            <div className={styles.dynamicIsland} />
            {imageUrl ? (
              <Link href={targetHref} style={{ display: "block", flex: 1 }}>
                <img
                  src={imageUrl}
                  alt={headline || "Mockup"}
                  style={{
                    width: "100%",
                    height: "360px",
                    objectFit: "cover",
                    borderRadius: "20px",
                  }}
                />
              </Link>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "1rem",
                  textAlign: "center",
                  padding: "1.5rem",
                  borderRadius: "22px",
                  background:
                    "linear-gradient(145deg, color-mix(in srgb, var(--primary) 15%, transparent), color-mix(in srgb, var(--secondary) 15%, transparent))",
                }}
              >
                <span style={{ fontSize: "3rem" }}>📱</span>
                <strong style={{ fontSize: "1.1rem" }}>
                  {orgConfig?.appBranding?.appTitle || "Matger Pro"}
                </strong>
                <p style={{ fontSize: "0.85rem", opacity: 0.75, margin: 0 }}>
                  {lang === "ar"
                    ? "واجهة متجرك الذكية متجاوبة بالكامل وتعمل بسرعة البرق"
                    : "Your smart storefront responsive & lightning fast"}
                </p>
                <Link
                  href={targetHref}
                  className="glowButton"
                  style={{ fontSize: "0.82rem", padding: "0.5rem 1rem" }}
                >
                  {lang === "ar" ? "معاينة حية" : "Live Preview"}
                </Link>
              </div>
            )}
          </div>

          {floatingStats.map((stat: any, idx: number) => (
            <div key={idx} className={styles.floatingStatPill}>
              <span>{idx === 0 ? "⚡" : "📈"}</span>
              <div>
                <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                  {resolveLocalizedText(stat.label, lang)}
                </div>
                <div style={{ color: "var(--primary)", fontWeight: 800 }}>
                  {resolveLocalizedText(stat.value, lang)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

