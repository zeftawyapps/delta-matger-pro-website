"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { getSectionHeaderTexts, resolveLocalizedText } from "@/utils/sectionHelpers";
import SectionHeader from "@/components/common/SectionHeader";
import { SectionConfig } from "@/types";
import styles from "./StoreComponents.module.css";

interface TabItem {
  icon?: string;
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  targetType?: "product" | "post" | "custom_url";
  productId?: string;
  postSlug?: string;
  customUrl?: string;
}

interface Tab {
  label?: string | Record<string, string>;
  content?: string | Record<string, string>;
  items?: TabItem[];
  targetType?: "product" | "post" | "custom_url";
  productId?: string;
  postSlug?: string;
  customUrl?: string;
  buttonText?: string | Record<string, string>;
}

interface TabsShowcaseProps {
  tabs?: Tab[];
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  config?: SectionConfig;
}

export default function TabsShowcase({ tabs, title, description, config }: TabsShowcaseProps) {
  const { lang } = useApp();
  const [activeTab, setActiveTab] = useState(0);

  const { titleText, descText, hasHeader } = getSectionHeaderTexts({ title, description }, lang);
  const displayTabs = tabs && tabs.length > 0 ? tabs : [];
  if (displayTabs.length === 0) return null;

  const currentTab = displayTabs[activeTab] || displayTabs[0];
  const tabItems = currentTab.items || [];

  const getHref = (obj: { targetType?: string; productId?: string; postSlug?: string; customUrl?: string }) => {
    if (obj.targetType === "product" && obj.productId) return `/store/${obj.productId}`;
    if (obj.targetType === "post" && obj.postSlug) return `/blog/${obj.postSlug}`;
    if (obj.targetType === "custom_url" && obj.customUrl) return obj.customUrl;
    if (obj.productId) return `/store/${obj.productId}`;
    if (obj.postSlug) return `/blog/${obj.postSlug}`;
    if (obj.customUrl) return obj.customUrl;
    return null;
  };

  const tabCtaHref = getHref(currentTab);
  const tabCtaText = resolveLocalizedText(currentTab.buttonText, lang);

  return (
    <section className={`${styles.landingSection} animateFadeUp`}>
      <SectionHeader title={titleText} description={descText} config={config} />

      <div className={styles.tabsShowcaseWrapper}>
        <div className={styles.tabButtons}>
          {displayTabs.map((tab, index) => (
            <button
              key={index}
              type="button"
              className={`${styles.tabButton} ${activeTab === index ? styles.tabButtonActive : ""}`}
              onClick={() => setActiveTab(index)}
            >
              {resolveLocalizedText(tab.label, lang)}
            </button>
          ))}
        </div>

        <div className={`${styles.tabContent} glassCard attractiveCard`}>
          {resolveLocalizedText(currentTab.content, lang) && (
            <p className={styles.tabContentText}>{resolveLocalizedText(currentTab.content, lang)}</p>
          )}
          {tabItems.length > 0 && (
            <div className={styles.tabItemsGrid}>
              {tabItems.map((item, index) => {
                const itemHref = getHref(item);
                const cardInner = (
                  <>
                    <span className={styles.tabItemIcon}>{item.icon || "⚡"}</span>
                    <div>
                      <h4>{resolveLocalizedText(item.title, lang)}</h4>
                      <p>{resolveLocalizedText(item.description, lang)}</p>
                    </div>
                  </>
                );
                return itemHref ? (
                  <Link key={index} href={itemHref} className={styles.tabItemCard} style={{ textDecoration: "none" }}>
                    {cardInner}
                  </Link>
                ) : (
                  <div key={index} className={styles.tabItemCard}>
                    {cardInner}
                  </div>
                );
              })}
            </div>
          )}
          {tabCtaHref && (
            <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "center" }}>
              <Link href={tabCtaHref} className="glowButton">
                {tabCtaText || (lang === "ar" ? "تصفح التفاصيل" : "View Details")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
