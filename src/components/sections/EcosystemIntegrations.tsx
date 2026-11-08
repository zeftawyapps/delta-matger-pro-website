"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { getSectionHeaderTexts, resolveLocalizedText } from "@/utils/sectionHelpers";
import SectionHeader from "@/components/common/SectionHeader";
import styles from "./Sections.module.css";

interface EcosystemIntegrationsProps {
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  config?: Record<string, any>;
}

const PARTNER_LABELS: Record<string, { label: string; icon: string }> = {
  mada: { label: "مدى / Mada", icon: "💳" },
  apple_pay: { label: "Apple Pay", icon: "🍎" },
  visa: { label: "Visa / MasterCard", icon: "💳" },
  tabby: { label: "تابي / Tabby", icon: "🛍️" },
  tamara: { label: "تمارا / Tamara", icon: "✨" },
  aramex: { label: "أرامكس / Aramex", icon: "📦" },
  smsa: { label: "سمسا / SMSA", icon: "🚚" },
  bosta: { label: "بوسطة / Bosta", icon: "🚀" },
  spl: { label: "سبل / SPL", icon: "📮" },
};

export default function EcosystemIntegrations({
  title,
  description,
  config = {},
}: EcosystemIntegrationsProps) {
  const { lang } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const { titleText, descText, hasHeader } = getSectionHeaderTexts({ title, description }, lang);

  const categories = Array.isArray(config.categories) ? config.categories : [];
  if (categories.length === 0) return null;

  const currentCat = categories[activeTab] || categories[0];
  const logos = Array.isArray(currentCat.logos)
    ? currentCat.logos
    : Array.isArray(currentCat.items)
    ? currentCat.items
    : [];

  return (
    <section className={`${styles.sectionContainer} animateFadeUp`}>
      <SectionHeader
        title={titleText}
        subtitle={descText}
        config={config}
      />

      {categories.length > 1 && (
        <div className={styles.screensTabsBar}>
          {categories.map((cat: any, idx: number) => (
            <button
              key={cat.id || idx}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`${styles.screenTabPill} ${
                activeTab === idx ? styles.screenTabPillActive : ""
              }`}
            >
              {resolveLocalizedText(cat.name || cat.label, lang)}
            </button>
          ))}
        </div>
      )}

      <div className={styles.integrationsGrid}>
        {logos.map((logoItem: any, idx: number) => {
          const isString = typeof logoItem === "string";
          const key = isString ? logoItem.toLowerCase() : logoItem.id || "";
          const preset = PARTNER_LABELS[key];
          const label = isString
            ? preset?.label || logoItem
            : resolveLocalizedText(logoItem.name || logoItem.title, lang);
          const icon = isString ? preset?.icon || "🔗" : logoItem.icon || "🔗";

          return (
            <div key={idx} className={`${styles.integrationLogoCard} glassCard attractiveCard`}>
              <span style={{ fontSize: "1.25rem" }}>{icon}</span>
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

