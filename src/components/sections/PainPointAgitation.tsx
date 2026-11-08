"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { getSectionHeaderTexts, resolveLocalizedText } from "@/utils/sectionHelpers";
import SectionHeader from "@/components/common/SectionHeader";
import styles from "./Sections.module.css";

interface PainPointAgitationProps {
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  config?: Record<string, any>;
}

const PAIN_ICONS: Record<string, string> = {
  "clock-alert": "⏳",
  "percent-cut": "💸",
  "device-crash": "⚠️",
};

export default function PainPointAgitation({
  title,
  description,
  config = {},
}: PainPointAgitationProps) {
  const { lang } = useApp();
  const { titleText, descText, hasHeader } = getSectionHeaderTexts({ title, description }, lang);
  const badgeText = resolveLocalizedText(config.badgeText, lang);
  const highlightAlertWord = resolveLocalizedText(config.highlightAlertWord, lang);
  const cards = Array.isArray(config.cards)
    ? config.cards
    : Array.isArray(config.items)
    ? config.items
    : [];

  if (cards.length === 0) return null;

  return (
    <section className={`${styles.sectionContainer} animateFadeUp`}>
      <SectionHeader
        title={titleText}
        subtitle={descText}
        badge={badgeText}
        config={config}
      />

      <div className={styles.painGrid}>
        {cards.map((card: any, idx: number) => {
          const icon = PAIN_ICONS[card.icon] || card.icon || "❗";
          return (
            <div key={idx} className={`${styles.painCard} glassCard attractiveCard`}>
              <div className={styles.painIconBox}>{icon}</div>
              <h3 style={{ margin: 0, fontSize: "1.25rem" }}>
                {resolveLocalizedText(card.title, lang)}
              </h3>
              <p style={{ margin: 0, opacity: 0.78 }}>
                {resolveLocalizedText(card.desc || card.description, lang)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

