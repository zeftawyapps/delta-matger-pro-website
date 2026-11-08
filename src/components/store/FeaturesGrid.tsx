"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { getSectionHeaderTexts, resolveLocalizedText } from "@/utils/sectionHelpers";
import SectionHeader from "@/components/common/SectionHeader";
import styles from "./StoreComponents.module.css";

interface FeatureItem {
  icon?: string;
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  targetType?: "product" | "post" | "custom_url";
  productId?: string;
  postSlug?: string;
  customUrl?: string;
  buttonText?: string | Record<string, string>;
}

interface FeaturesGridProps {
  items?: FeatureItem[];
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  config?: any;
}

export default function FeaturesGrid({ items, title, description, config }: FeaturesGridProps) {
  const { lang } = useApp();

  const { titleText, descText, hasHeader } = getSectionHeaderTexts({ title, description }, lang);
  const displayItems = items && items.length > 0 ? items : [];

  if (displayItems.length === 0) return null;

  const getItemHref = (item: FeatureItem): string | null => {
    if (item.targetType === "product" && item.productId) {
      return `/store/${item.productId}`;
    }
    if (item.targetType === "post" && item.postSlug) {
      return `/blog/${item.postSlug}`;
    }
    if (item.targetType === "custom_url" && item.customUrl) {
      return item.customUrl;
    }
    if (item.productId) return `/store/${item.productId}`;
    if (item.postSlug) return `/blog/${item.postSlug}`;
    if (item.customUrl) return item.customUrl;
    return null;
  };

  return (
    <section className={`${styles.landingSection} animateFadeUp`}>
      <SectionHeader
        title={titleText}
        subtitle={descText}
        config={config}
      />
      <div className={`${styles.featuresGrid} ${config?.mobileDisplayMode === "carousel" ? styles.mobileCarousel : ""}`}>
        {displayItems.map((item, index) => {
          const href = getItemHref(item);
          const btnLabel = resolveLocalizedText(item.buttonText, lang);
          return (
            <div key={index} className={`${styles.featureCard} glassCard attractiveCard`}>
              <span className={styles.featureIcon}>{item.icon || "✨"}</span>
              <h3>{resolveLocalizedText(item.title, lang)}</h3>
              <p>{resolveLocalizedText(item.description, lang)}</p>
              {href && (
                <Link
                  href={href}
                  className={styles.viewAllBtn}
                  style={{ marginTop: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.35rem", fontWeight: 600 }}
                >
                  {btnLabel || (lang === "ar" ? "اكتشف المزيد" : "Learn More")}{" "}
                  {lang === "ar" ? "←" : "→"}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
