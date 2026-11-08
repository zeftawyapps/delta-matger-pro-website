"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { getSectionHeaderTexts, resolveLocalizedText } from "@/utils/sectionHelpers";
import SectionHeader from "@/components/common/SectionHeader";
import styles from "./Sections.module.css";

interface QuickTrustStripProps {
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  config?: Record<string, any>;
}

const ICON_MAP: Record<string, string> = {
  "shield-check": "🛡️",
  percent: "💯",
  whatsapp: "💬",
  zap: "⚡",
  truck: "🚚",
  award: "🏆",
  check: "✅",
};

export default function QuickTrustStrip({
  title,
  description,
  config = {},
}: QuickTrustStripProps) {
  const { lang } = useApp();
  const { titleText, descText, hasHeader } = getSectionHeaderTexts({ title, description }, lang);
  const items = Array.isArray(config.items) ? config.items : [];

  if (items.length === 0) return null;

  return (
    <section className={`${styles.sectionContainer} animateFadeUp`}>
      <SectionHeader
        title={titleText}
        subtitle={descText}
        config={config}
      />
      <div className={`${styles.quickTrustBar} glassCard attractiveCard`}>
        {items.map((item: any, idx: number) => {
          const rawIcon = item.icon || "";
          const displayIcon = ICON_MAP[rawIcon] || rawIcon || "✓";
          const text = resolveLocalizedText(item.text || item.title, lang);
          const sub = resolveLocalizedText(item.description || item.value, lang);
          return (
            <React.Fragment key={idx}>
              {idx > 0 && <span className={styles.neonDot} aria-hidden="true" />}
              <div className={styles.quickTrustItem}>
                <span>{displayIcon}</span>
                <span>
                  {text}
                  {sub ? ` : ${sub}` : ""}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}

