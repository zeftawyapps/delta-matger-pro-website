"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { getSectionHeaderTexts, resolveLocalizedText } from "@/utils/sectionHelpers";
import styles from "./Sections.module.css";

interface UrgencyOfferStripProps {
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  config?: Record<string, any>;
}

export default function UrgencyOfferStrip({
  title,
  description,
  config = {},
}: UrgencyOfferStripProps) {
  const { lang } = useApp();
  const { titleText, descText } = getSectionHeaderTexts({ title, description }, lang);

  const badgeText = resolveLocalizedText(config.badgeText, lang);
  const offerHeadline = resolveLocalizedText(config.offerHeadline, lang) || titleText;
  const offerSub = resolveLocalizedText(config.offerDescription, lang) || descText;
  const buttonText = resolveLocalizedText(config.buttonText, lang);
  const buttonLink = config.buttonLink || "/store";
  const showCountdown = config.showCountdown === true;

  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, mins: 35, secs: 40 });

  useEffect(() => {
    if (!showCountdown) return;
    const targetTime = config.countdownEndsAt
      ? new Date(config.countdownEndsAt).getTime()
      : Date.now() + 3 * 24 * 60 * 60 * 1000;

    const timer = setInterval(() => {
      const diff = Math.max(0, targetTime - Date.now());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / 1000 / 60) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, mins, secs });
    }, 1000);

    return () => clearInterval(timer);
  }, [showCountdown, config.countdownEndsAt]);

  return (
    <section className={`${styles.sectionContainer} animateFadeUp`}>
      <div className={`${styles.urgencyBanner} glassCard attractiveCard`}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
          {badgeText && <span className={styles.trustedBadge}>{badgeText}</span>}
          {offerHeadline && <h3 style={{ margin: 0, fontSize: "1.45rem" }}>{offerHeadline}</h3>}
          {offerSub && <p style={{ margin: 0, opacity: 0.82 }}>{offerSub}</p>}
        </div>

        {showCountdown && (
          <div className={styles.countdownBoxes}>
            <div className={styles.countdownUnit}>
              <span className={styles.countdownNumber}>{String(timeLeft.days).padStart(2, "0")}</span>
              <span className={styles.countdownLabel}>{lang === "ar" ? "يوم" : "Days"}</span>
            </div>
            <div className={styles.countdownUnit}>
              <span className={styles.countdownNumber}>{String(timeLeft.hours).padStart(2, "0")}</span>
              <span className={styles.countdownLabel}>{lang === "ar" ? "ساعة" : "Hrs"}</span>
            </div>
            <div className={styles.countdownUnit}>
              <span className={styles.countdownNumber}>{String(timeLeft.mins).padStart(2, "0")}</span>
              <span className={styles.countdownLabel}>{lang === "ar" ? "دقيقة" : "Min"}</span>
            </div>
            <div className={styles.countdownUnit}>
              <span className={styles.countdownNumber}>{String(timeLeft.secs).padStart(2, "0")}</span>
              <span className={styles.countdownLabel}>{lang === "ar" ? "ثانية" : "Sec"}</span>
            </div>
          </div>
        )}

        {buttonText && (
          <Link href={buttonLink} className="glowButton">
            {buttonText}
          </Link>
        )}
      </div>
    </section>
  );
}

