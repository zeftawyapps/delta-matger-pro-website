"use client";

import { useApp } from "@/context/AppContext";
import styles from "./StoreComponents.module.css";

interface FeatureItem {
  icon?: string;
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
}

interface FeaturesGridProps {
  items?: FeatureItem[];
  title?: string;
  description?: string;
}

export default function FeaturesGrid({ items, title, description }: FeaturesGridProps) {
  const { lang } = useApp();

  const resolveText = (val?: string | Record<string, string>) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    return val[lang] || val.ar || "";
  };

  const displayItems = items && items.length > 0 ? items : [];

  if (displayItems.length === 0) return null;

  return (
    <section className={`${styles.landingSection} animateFadeUp`}>
      {(title || description) && (
        <div className={styles.landingSectionHeader}>
          {title && <h2 className={styles.sectionTitle}>{title}</h2>}
          {description && <p className={styles.sectionSubtitle}>{description}</p>}
        </div>
      )}
      <div className={styles.featuresGrid}>
        {displayItems.map((item, index) => (
          <div key={index} className={`${styles.featureCard} glassCard`}>
            <span className={styles.featureIcon}>{item.icon || "✨"}</span>
            <h3>{resolveText(item.title)}</h3>
            <p>{resolveText(item.description)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
