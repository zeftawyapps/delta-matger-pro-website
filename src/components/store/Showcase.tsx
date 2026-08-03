"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import styles from "./StoreComponents.module.css";

interface ShowcaseTab {
  label?: string | Record<string, string>;
  imageUrl?: string;
}

interface ShowcaseProps {
  tabs?: ShowcaseTab[];
  title?: string;
  description?: string;
}

export default function Showcase({ tabs, title, description }: ShowcaseProps) {
  const { lang } = useApp();
  const [activeTab, setActiveTab] = useState(0);

  const resolveText = (val?: string | Record<string, string>) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    return val[lang] || val.ar || "";
  };

  const displayTabs = tabs && tabs.length > 0 ? tabs : [];
  if (displayTabs.length === 0) return null;

  const currentTab = displayTabs[activeTab] || displayTabs[0];
  const imageUrl = currentTab.imageUrl;

  return (
    <section className={`${styles.landingSection} animateFadeUp`}>
      {(title || description) && (
        <div className={styles.landingSectionHeader}>
          {title && <h2 className={styles.sectionTitle}>{title}</h2>}
          {description && <p className={styles.sectionSubtitle}>{description}</p>}
        </div>
      )}

      <div className={styles.showcaseWrapper}>
        <div className={styles.tabButtons}>
          {displayTabs.map((tab, index) => (
            <button
              key={index}
              type="button"
              className={`${styles.tabButton} ${activeTab === index ? styles.tabButtonActive : ""}`}
              onClick={() => setActiveTab(index)}
            >
              {resolveText(tab.label)}
            </button>
          ))}
        </div>

        <div className={`${styles.showcaseImageWrapper} glassCard`}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={resolveText(currentTab.label)}
              className={styles.showcaseImage}
            />
          ) : (
            <div className={styles.showcasePlaceholder}>
              <span>🖼️</span>
              <p>{lang === "ar" ? "أضف رابط الصورة من لوحة التحكم" : "Add image URL from admin panel"}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
