"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { getSectionHeaderTexts, resolveLocalizedText } from "@/utils/sectionHelpers";
import SectionHeader from "@/components/common/SectionHeader";
import styles from "./Sections.module.css";

interface ComparisonMatrixProps {
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  config?: Record<string, any>;
}

export default function ComparisonMatrix({
  title,
  description,
  config = {},
}: ComparisonMatrixProps) {
  const { lang } = useApp();
  const { titleText, descText, hasHeader } = getSectionHeaderTexts({ title, description }, lang);

  const oldWayTitle = resolveLocalizedText(config.oldWayTitle, lang);
  const newWayTitle = resolveLocalizedText(config.newWayTitle, lang);
  const oldWayItems = Array.isArray(config.oldWayItems) ? config.oldWayItems : [];
  const newWayItems = Array.isArray(config.newWayItems) ? config.newWayItems : [];

  if (oldWayItems.length === 0 && newWayItems.length === 0) return null;

  return (
    <section className={`${styles.sectionContainer} animateFadeUp`}>
      <SectionHeader
        title={titleText}
        subtitle={descText}
        config={config}
      />

      <div className={styles.comparisonGrid}>
        {/* Column 1: Old Way / Column A */}
        <div className={`${styles.comparisonColOld} glassCard`}>
          {oldWayTitle && <h3 style={{ margin: 0, fontSize: "1.3rem" }}>{oldWayTitle}</h3>}
          <ul className={styles.comparisonList}>
            {oldWayItems.map((item: any, idx: number) => (
              <li key={idx}>
                <span className={styles.iconCross}>{config.oldWayIcon || "✕"}</span>
                <span>{resolveLocalizedText(item, lang)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 2: New Way / Column B */}
        <div className={`${styles.comparisonColNew} glassCard attractiveCard`}>
          {newWayTitle && (
            <h3
              style={{
                margin: 0,
                fontSize: "1.3rem",
                color: "var(--primary)",
              }}
            >
              {newWayTitle}
            </h3>
          )}
          <ul className={styles.comparisonList}>
            {newWayItems.map((item: any, idx: number) => (
              <li key={idx}>
                <span className={styles.iconCheck}>{config.newWayIcon || "✓"}</span>
                <span>{resolveLocalizedText(item, lang)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

