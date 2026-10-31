"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { getSectionHeaderTexts, resolveLocalizedText } from "@/utils/sectionHelpers";
import styles from "./Sections.module.css";

interface HighImpactCtaBannerProps {
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  config?: Record<string, any>;
}

export default function HighImpactCtaBanner({
  title,
  description,
  config = {},
}: HighImpactCtaBannerProps) {
  const { lang } = useApp();
  const { titleText, descText } = getSectionHeaderTexts({ title, description }, lang);

  const headline = resolveLocalizedText(config.headline, lang) || titleText;
  const subheadline = resolveLocalizedText(config.subheadline, lang) || descText;
  const buttonText = resolveLocalizedText(config.buttonText, lang);
  const buttonLink = config.buttonLink || "/store";
  const gradientColors = Array.isArray(config.buttonGradient) ? config.buttonGradient : null;

  return (
    <section className={`${styles.sectionContainer} animateFadeUp`}>
      <div
        className={styles.highImpactBanner}
        style={
          gradientColors && gradientColors.length >= 2
            ? { background: `linear-gradient(135deg, ${gradientColors.join(", ")})` }
            : undefined
        }
      >
        {headline && <h2>{headline}</h2>}
        {subheadline && <p>{subheadline}</p>}
        {buttonText && (
          <Link href={buttonLink} className={styles.ctaWhiteButton}>
            <span>{buttonText}</span>
            <span>{lang === "ar" ? "←" : "→"}</span>
          </Link>
        )}
      </div>
    </section>
  );
}

