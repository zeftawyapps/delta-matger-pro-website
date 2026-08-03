"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import styles from "./StoreComponents.module.css";

interface TabItem {
  icon?: string;
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
}

interface Tab {
  label?: string | Record<string, string>;
  content?: string | Record<string, string>;
  items?: TabItem[];
}

interface TabsShowcaseProps {
  tabs?: Tab[];
  title?: string;
  description?: string;
}

export default function TabsShowcase({ tabs, title, description }: TabsShowcaseProps) {
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
  const tabItems = currentTab.items || [];

  return (
    <section className={`${styles.landingSection} animateFadeUp`}>
      {(title || description) && (
        <div className={styles.landingSectionHeader}>
          {title && <h2 className={styles.sectionTitle}>{title}</h2>}
          {description && <p className={styles.sectionSubtitle}>{description}</p>}
        </div>
      )}

      <div className={styles.tabsShowcaseWrapper}>
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

        <div className={`${styles.tabContent} glassCard`}>
          {resolveText(currentTab.content) && (
            <p className={styles.tabContentText}>{resolveText(currentTab.content)}</p>
          )}
          {tabItems.length > 0 && (
            <div className={styles.tabItemsGrid}>
              {tabItems.map((item, index) => (
                <div key={index} className={styles.tabItemCard}>
                  <span className={styles.tabItemIcon}>{item.icon || "⚡"}</span>
                  <div>
                    <h4>{resolveText(item.title)}</h4>
                    <p>{resolveText(item.description)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
