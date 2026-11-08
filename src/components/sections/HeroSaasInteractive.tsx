"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { getFullImageUrl, api } from "@/services/api";
import { getSectionHeaderTexts, resolveLocalizedText } from "@/utils/sectionHelpers";
import clientConfig from "@/config/clientConfig.json";
import styles from "./Sections.module.css";

const normalizeUrl = (url?: string): string => {
  if (!url) return "";
  const trimmed = String(url).trim();
  if (!trimmed || trimmed === "#") return "";
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("//")) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  if (trimmed.includes(".")) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

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

  // 1. Live Preview Link & Label (خاص بالمعاينة الحية وإطار الهاتف)
  const rawPreview =
    config.previewButtonLink ||
    config.previewLink ||
    config.previewUrl ||
    config.livePreviewUrl ||
    config.demoUrl ||
    (config.buttonLink &&
    !config.buttonLink.includes("wa.me") &&
    !config.buttonLink.includes("whatsapp.com")
      ? config.buttonLink
      : "");

  const previewLink = normalizeUrl(rawPreview);

  const previewBtnLabel =
    resolveLocalizedText(config.previewButtonText || config.previewText, lang) ||
    (lang === "ar" ? "معاينة حية" : "Live Preview");

  const openPreview = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!previewLink || previewLink === "#") return;

    // Always open external/preview links in a new tab so they are never blocked by iframes
    window.open(previewLink, "_blank", "noopener,noreferrer");
  };

  // 2. Action / CTA Button Link (خاص بنموذج الإدخال السريع أو زر الواتساب)
  const actionLink =
    config.buttonLink ||
    (config.targetType === "product" && config.productId
      ? `/store/${config.productId}`
      : config.targetType === "post" && config.postSlug
      ? `/blog/${config.postSlug}`
      : "/store");

  const isActionExternal = Boolean(
    actionLink &&
      (actionLink.startsWith("http://") ||
        actionLink.startsWith("https://") ||
        actionLink.startsWith("//"))
  );

  // Comprehensive WhatsApp Resolution for Action
  const rawWa =
    config.whatsappNumber ||
    config.whatsapp ||
    config.phone ||
    quickInput.whatsappNumber ||
    quickInput.whatsapp ||
    quickInput.phone ||
    orgConfig?.socialMedia?.whatsapp ||
    (orgConfig as any)?.phone ||
    (orgConfig as any)?.supportPhone ||
    (orgConfig as any)?.contact?.whatsapp ||
    (orgConfig as any)?.contact?.phone ||
    (clientConfig as any)?.socialMedia?.whatsapp ||
    (clientConfig as any)?.footer?.phone ||
    "";

  let cleanPhone = String(rawWa).replace(/[^0-9]/g, "");
  if (cleanPhone.startsWith("01") && cleanPhone.length === 11) {
    cleanPhone = "2" + cleanPhone;
  } else if (cleanPhone.startsWith("05") && cleanPhone.length === 10) {
    cleanPhone = "966" + cleanPhone.slice(1);
  }

  const isWaAction =
    Boolean(
      actionLink && (actionLink.includes("wa.me") || actionLink.includes("whatsapp.com"))
    ) ||
    Boolean(
      quickInput.buttonText &&
        String(quickInput.buttonText).toLowerCase().includes("واتساب") &&
        cleanPhone
    );

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const userText = inputVal.trim();

    // 1. Capture the user lead in background if entered
    if (userText) {
      const orgId = orgConfig?.id || clientConfig.defaultOrgName || "default";
      api
        .submitFeedback(orgId, {
          name: `Lead: ${userText}`,
          contact: userText,
          type: "hero_quick_lead",
          message: `طلب من الواجهة الرئيسية. البيانات/الرقم: ${userText}`,
        })
        .catch(() => {});
    }

    // 2. Open action link (WhatsApp or custom actionLink)
    let finalUrl = actionLink;
    if (isWaAction) {
      const defaultMsg =
        lang === "ar"
          ? "مرحباً، أرغب في الاستفسار والبدء والتجربة الفورية."
          : "Hello, I want to inquire and start my trial.";
      const leadMsg =
        lang === "ar"
          ? `مرحباً، أرغب في البدء والتجربة الفورية. رقمي/متجري: ${userText}`
          : `Hello, I want to start my trial. My info: ${userText}`;
      const encodedMsg = encodeURIComponent(userText ? leadMsg : defaultMsg);

      if (
        finalUrl === "https://wa.me/" ||
        finalUrl === "https://wa.me" ||
        !finalUrl.includes("wa.me")
      ) {
        finalUrl = `https://wa.me/${cleanPhone || ""}?text=${encodedMsg}`;
      } else {
        finalUrl = finalUrl.includes("?")
          ? `${finalUrl}&text=${encodedMsg}`
          : `${finalUrl}?text=${encodedMsg}`;
      }
    }

    if (finalUrl && finalUrl !== "#") {
      if (isActionExternal || isWaAction) {
        window.open(finalUrl, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = finalUrl;
      }
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
            config.buttonText &&
              (isActionExternal ? (
                <a
                  href={actionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glowButton"
                >
                  {resolveLocalizedText(config.buttonText, lang)} ↗
                </a>
              ) : (
                <Link href={actionLink} className="glowButton">
                  {resolveLocalizedText(config.buttonText, lang)}
                </Link>
              ))
          )}
        </div>

        <div className={styles.heroMockupCol}>
          <div className={`${styles.phoneMockupShell} ${config?.floatingMockup !== false ? styles.phoneMockupFloating : ""} attractiveCard`}>
            <div className={styles.dynamicIsland} />
            {imageUrl ? (
              <a
                href={previewLink || "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={openPreview}
                style={{
                  position: "relative",
                  display: "block",
                  flex: 1,
                  width: "100%",
                  height: "100%",
                  borderRadius: "20px",
                  overflow: "hidden",
                  cursor: "pointer",
                  textDecoration: "none",
                }}
                title={previewBtnLabel}
              >
                <img
                  src={imageUrl}
                  alt={headline || "Mockup"}
                  style={{
                    width: "100%",
                    height: "360px",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "14px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 3,
                  }}
                >
                  <span
                    className="glowButton"
                    style={{
                      fontSize: "0.82rem",
                      padding: "0.45rem 1rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      pointerEvents: "none",
                    }}
                  >
                    <span>{previewBtnLabel}</span>
                    <span>↗</span>
                  </span>
                </div>
              </a>
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
                  cursor: "pointer",
                }}
                onClick={openPreview}
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
                <a
                  href={previewLink || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glowButton"
                  style={{
                    fontSize: "0.82rem",
                    padding: "0.5rem 1rem",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                  onClick={openPreview}
                >
                  <span>{previewBtnLabel}</span>
                  <span>↗</span>
                </a>
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

