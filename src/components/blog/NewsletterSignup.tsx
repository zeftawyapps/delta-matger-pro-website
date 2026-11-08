"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";
import clientConfig from "@/config/clientConfig.json";
import { getSectionHeaderTexts, resolveLocalizedText } from "@/utils/sectionHelpers";
import SectionHeader from "@/components/common/SectionHeader";
import { SectionConfig } from "@/types";
import styles from "./BlogComponents.module.css";

interface PillarItem {
  title: string;
  description: string;
  icon: string;
}

interface NewsletterSignupProps {
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  config?: SectionConfig;
  source?: string;
}

export default function NewsletterSignup({
  title,
  description,
  config = {},
  source = "newsletter_section",
}: NewsletterSignupProps = {}) {
  const { t, lang, config: orgConfig, authToken } = useApp();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { titleText, descText } = getSectionHeaderTexts(
    { title, description },
    lang
  );

  // 1. Resolve Pillars & Features (المميزات والركائز)
  const rawPillars =
    config?.pillars ||
    config?.features ||
    config?.benefits ||
    config?.items ||
    config?.perks ||
    config?.points ||
    config?.highlights;

  const pillarsList: PillarItem[] = Array.isArray(rawPillars)
    ? (rawPillars
        .map((item: any) => {
          if (!item) return null;
          if (typeof item === "string") {
            return {
              title: item,
              description: "",
              icon: "✓",
            };
          }
          if (typeof item === "object") {
            const itemTitle = resolveLocalizedText(
              item.title || item.text || item.label || item.name,
              lang
            );
            const itemDesc = resolveLocalizedText(
              item.description || item.desc || item.subtitle || item.subtext,
              lang
            );
            const itemIcon = item.icon || "✓";
            if (!itemTitle && !itemDesc) return null;
            return {
              title: itemTitle,
              description: itemDesc,
              icon: itemIcon,
            };
          }
          return null;
        })
        .filter(Boolean) as PillarItem[])
    : [];

  const hasPillars = pillarsList.length > 0;
  const anyHasDescription = pillarsList.some((p) => Boolean(p.description));
  const pillarsLayout =
    config?.pillarsLayout ||
    config?.featuresLayout ||
    (anyHasDescription ? "grid" : "chips");

  const pillarsTitle = resolveLocalizedText(
    config?.pillarsTitle || config?.featuresTitle,
    lang
  );
  const featuresPosition =
    config?.featuresPosition || config?.pillarsPosition || "after_form";

  const submitBtnText =
    resolveLocalizedText(
      config?.buttonText || config?.submitText || config?.ctaText,
      lang
    ) || t.subscribe;

  const placeholderText =
    resolveLocalizedText(
      config?.placeholder || config?.inputPlaceholder,
      lang
    ) || t.emailPlaceholder;

  const disclaimerText = resolveLocalizedText(
    config?.disclaimer || config?.privacyText || config?.note,
    lang
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg(
        lang === "ar"
          ? "يرجى إدخال بريد إلكتروني صحيح."
          : "Please enter a valid email address."
      );
      return;
    }

    setLoading(true);
    try {
      const orgId = orgConfig?.id || clientConfig.defaultOrgName || "default";
      await api.subscribeNewsletter({
        organizationId: orgId,
        email: trimmedEmail,
        source: config?.source || source,
        lang,
        token: authToken || undefined,
      });
      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.toLowerCase().includes("already") || msg.includes("مسجل")) {
        setErrorMsg(
          lang === "ar"
            ? "هذا البريد مسجل لدينا بالفعل!"
            : "This email is already subscribed!"
        );
      } else {
        setErrorMsg(
          lang === "ar"
            ? "حدث خطأ في الاتصال، يرجى المحاولة لاحقاً."
            : "Connection error, please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Render Features / Pillars component
  const renderPillars = () => {
    if (!hasPillars) return null;

    return (
      <div className={styles.newsletterFeaturesArea}>
        {pillarsTitle && (
          <h4 className={styles.newsletterFeaturesTitle}>{pillarsTitle}</h4>
        )}

        {pillarsLayout === "grid" ? (
          <div className={styles.newsletterPillarsGrid}>
            {pillarsList.map((item, idx) => (
              <div key={idx} className={styles.newsletterPillarCard}>
                {item.icon && (
                  <div className={styles.pillarIconBox}>{item.icon}</div>
                )}
                <div className={styles.pillarBody}>
                  {item.title && <h5 className={styles.pillarTitle}>{item.title}</h5>}
                  {item.description && (
                    <p className={styles.pillarDescription}>{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ul className={styles.newsletterFeaturesList}>
            {pillarsList.map((item, idx) => (
              <li key={idx} className={styles.newsletterFeatureChip}>
                <span className={styles.featureChipIcon}>{item.icon || "✓"}</span>
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <section className={`${styles.newsletterSection} animateFadeUp`}>
      <div className={`${styles.newsletterBox} glassCard attractiveCard`}>
        <div className={styles.newsletterContent}>
          {/* 1. Header with dynamic titleStyle, colors, alignment, badges */}
          <div className={styles.newsletterHeaderArea}>
            <SectionHeader
              title={titleText}
              description={descText}
              config={config}
            />
          </div>

          {/* Pillars before form if configured */}
          {featuresPosition === "before_form" && renderPillars()}

          {/* 2. Subscription Form Area */}
          <div className={styles.newsletterFormArea}>
            {success ? (
              <div className={styles.successMessage} role="alert">
                🎉{" "}
                {lang === "ar"
                  ? "شكراً لاشتراكك! تم تسجيل بريدك بنجاح في قائمتنا البريدية."
                  : t.successNewsletter}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.newsletterForm}>
                <input
                  type="email"
                  required
                  disabled={loading}
                  placeholder={placeholderText}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="customInput"
                />
                <button type="submit" disabled={loading} className="glowButton">
                  {loading
                    ? lang === "ar"
                      ? "جاري الاشتراك..."
                      : "Subscribing..."
                    : submitBtnText}
                </button>
              </form>
            )}

            {disclaimerText && (
              <p className={styles.newsletterDisclaimer}>
                <span>🔒</span> {disclaimerText}
              </p>
            )}

            {errorMsg && (
              <p className="inlineErrorBanner" style={{ marginTop: "0.75rem" }}>
                ⚠️ {errorMsg}
              </p>
            )}
          </div>

          {/* Pillars after form (default) */}
          {featuresPosition !== "before_form" && renderPillars()}
        </div>
      </div>
    </section>
  );
}
