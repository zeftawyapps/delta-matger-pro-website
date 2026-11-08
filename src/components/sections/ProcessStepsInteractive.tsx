"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { getSectionHeaderTexts, resolveLocalizedText } from "@/utils/sectionHelpers";
import SectionHeader from "@/components/common/SectionHeader";
import styles from "./Sections.module.css";

interface ProcessStepsInteractiveProps {
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  config?: Record<string, any>;
}

export default function ProcessStepsInteractive({
  title,
  description,
  config = {},
}: ProcessStepsInteractiveProps) {
  const { lang } = useApp();
  const { titleText, descText, hasHeader } = getSectionHeaderTexts({ title, description }, lang);
  const steps = Array.isArray(config.steps)
    ? config.steps
    : Array.isArray(config.items)
    ? config.items
    : [];

  if (steps.length === 0) return null;

  return (
    <section className={`${styles.sectionContainer} animateFadeUp`}>
      <SectionHeader
        title={titleText}
        subtitle={descText}
        config={config}
      />

      <div className={styles.stepsGrid}>
        {steps.map((step: any, idx: number) => {
          const num = step.number || String(idx + 1).padStart(2, "0");
          return (
            <div key={idx} className={`${styles.stepCard} glassCard attractiveCard`}>
              <span className={styles.stepWatermark}>{num}</span>
              <span className={styles.trustedBadge} style={{ width: "fit-content" }}>
                {num}
              </span>
              <h3 style={{ margin: 0, fontSize: "1.25rem" }}>
                {resolveLocalizedText(step.title, lang)}
              </h3>
              <p style={{ margin: 0, opacity: 0.8 }}>
                {resolveLocalizedText(step.desc || step.description, lang)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

