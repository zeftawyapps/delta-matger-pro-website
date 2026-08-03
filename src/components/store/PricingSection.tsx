"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import styles from "./StoreComponents.module.css";

interface PricingPlan {
  name?: string | Record<string, string>;
  price?: string;
  period?: string | Record<string, string>;
  features?: (string | Record<string, string>)[];
  isPopular?: boolean;
  buttonText?: string | Record<string, string>;
  buttonLink?: string;
}

interface PricingSectionProps {
  plans?: PricingPlan[];
  title?: string;
  description?: string;
  displayMode?: string;
}

export default function PricingSection({
  plans,
  title,
  description,
  displayMode,
}: PricingSectionProps) {
  const { lang } = useApp();

  const resolveText = (val?: string | Record<string, string>) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    return val[lang] || val.ar || "";
  };

  const displayPlans = plans && plans.length > 0 ? plans : [];
  if (displayPlans.length === 0) return null;

  const isHorizontalList = displayMode === "horizontal_list";

  return (
    <section className={`${styles.landingSection} animateFadeUp`}>
      {(title || description) && (
        <div className={styles.landingSectionHeader}>
          {title && <h2 className={styles.sectionTitle}>{title}</h2>}
          {description && <p className={styles.sectionSubtitle}>{description}</p>}
        </div>
      )}

      <div
        className={isHorizontalList ? styles.pricingHorizontalList : styles.pricingGrid}
      >
        {displayPlans.map((plan, index) => {
          const features = plan.features || [];
          const isPopular = plan.isPopular === true;

          return (
            <div
              key={index}
              className={`${styles.pricingCard} glassCard ${isPopular ? styles.pricingCardPopular : ""}`}
            >
              {isPopular && (
                <span className={styles.pricingBadge}>
                  {lang === "ar" ? "الأكثر شعبية" : "Most Popular"}
                </span>
              )}
              <h3 className={styles.pricingName}>{resolveText(plan.name)}</h3>
              <div className={styles.pricingPriceRow}>
                <span className={styles.pricingPrice}>{plan.price}</span>
                <span className={styles.pricingPeriod}>{resolveText(plan.period)}</span>
              </div>
              <ul className={styles.pricingFeatures}>
                {features.map((feature, featIndex) => (
                  <li key={featIndex}>
                    <span className={styles.pricingCheck}>✓</span>
                    {resolveText(feature as string | Record<string, string>)}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.buttonLink || "/contact"}
                className={`glowButton ${styles.pricingButton}`}
              >
                {resolveText(plan.buttonText) || (lang === "ar" ? "اشترك الآن" : "Subscribe")}
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
