"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { getSectionHeaderTexts, resolveLocalizedText } from "@/utils/sectionHelpers";
import SectionHeader from "@/components/common/SectionHeader";
import styles from "./Sections.module.css";

interface TargetAudienceIndustriesProps {
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  config?: Record<string, any>;
}

const INDUSTRY_ICONS: Record<string, string> = {
  "shopping-bag": "🛍️",
  shirt: "👕",
  truck: "🚚",
  coffee: "☕",
  activity: "🏥",
  store: "🏪",
  sparkles: "✨",
};

export default function TargetAudienceIndustries({
  title,
  description,
  config = {},
}: TargetAudienceIndustriesProps) {
  const { lang } = useApp();
  const { titleText, descText, hasHeader } = getSectionHeaderTexts(
    { title, description: description || config.subtitle },
    lang
  );
  const industries = Array.isArray(config.industries)
    ? config.industries
    : Array.isArray(config.items)
    ? config.items
    : [];

  if (industries.length === 0) return null;

  return (
    <section className={`${styles.sectionContainer} animateFadeUp`}>
      <SectionHeader
        title={titleText}
        subtitle={descText}
        config={config}
      />

      <div className={styles.industriesGrid}>
        {industries.map((ind: any, idx: number) => {
          const icon = INDUSTRY_ICONS[ind.icon] || ind.icon || "🌟";
          const name = resolveLocalizedText(ind.name || ind.title, lang);
          const desc = resolveLocalizedText(ind.description || ind.desc, lang);
          const link = ind.demoLink || ind.linkUrl;
          const content = (
            <>
              <span style={{ fontSize: "1.3rem" }}>{icon}</span>
              <div>
                <div>{name}</div>
                {desc && (
                  <div style={{ fontSize: "0.78rem", opacity: 0.75, fontWeight: 400 }}>
                    {desc}
                  </div>
                )}
              </div>
            </>
          );

          return link ? (
            <Link
              key={idx}
              href={link}
              className={`${styles.industryCapsule} glassCard attractiveCard`}
            >
              {content}
            </Link>
          ) : (
            <div key={idx} className={`${styles.industryCapsule} glassCard attractiveCard`}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}

