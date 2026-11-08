"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { getSectionHeaderTexts, resolveLocalizedText } from "@/utils/sectionHelpers";
import SectionHeader from "@/components/common/SectionHeader";
import storeStyles from "../store/StoreComponents.module.css";
import styles from "./Sections.module.css";

interface PricingSaasSliderProps {
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  config?: Record<string, any>;
}

export default function PricingSaasSlider({
  title,
  description,
  config = {},
}: PricingSaasSliderProps) {
  const { lang } = useApp();
  const [period, setPeriod] = useState<"monthly" | "yearly">(
    config.defaultPeriod === "monthly" ? "monthly" : "yearly"
  );

  const { titleText, descText, hasHeader } = getSectionHeaderTexts({ title, description }, lang);
  const plans = Array.isArray(config.plans) ? config.plans : [];
  if (plans.length === 0) return null;

  const yearlyDiscountBadge =
    resolveLocalizedText(config.yearlyDiscountBadge, lang) ||
    (lang === "ar" ? "وفر 20% 🎁" : "Save 20% 🎁");

  return (
    <section className={`${styles.sectionContainer} animateFadeUp`}>
      <SectionHeader
        title={titleText}
        subtitle={descText}
        config={config}
      />

      <div className={styles.periodToggleRow}>
        <div className={styles.periodTogglePill}>
          <button
            type="button"
            onClick={() => setPeriod("monthly")}
            className={`${styles.periodBtn} ${period === "monthly" ? styles.periodBtnActive : ""}`}
          >
            {lang === "ar" ? "شهري" : "Monthly"}
          </button>
          <button
            type="button"
            onClick={() => setPeriod("yearly")}
            className={`${styles.periodBtn} ${period === "yearly" ? styles.periodBtnActive : ""}`}
          >
            <span>{lang === "ar" ? "سنوي" : "Yearly"}</span>
            <span className={styles.discountTag}>{yearlyDiscountBadge}</span>
          </button>
        </div>
      </div>

      <div className={storeStyles.pricingGrid}>
        {plans.map((plan: any, idx: number) => {
          const isPopular = plan.isPopular === true;
          const activePrice =
            period === "yearly"
              ? plan.yearlyPrice ?? plan.price
              : plan.monthlyPrice ?? plan.price;
          const features = Array.isArray(plan.features) ? plan.features : [];

          return (
            <div
              key={plan.id || idx}
              className={`${storeStyles.pricingCard} glassCard attractiveCard ${
                isPopular ? storeStyles.pricingCardPopular : ""
              }`}
            >
              {isPopular && (
                <span className={storeStyles.pricingBadge}>
                  {lang === "ar" ? "الأكثر شعبية" : "Most Popular"}
                </span>
              )}
              <h3 className={storeStyles.pricingName}>{resolveLocalizedText(plan.name, lang)}</h3>
              <div className={storeStyles.pricingPriceRow}>
                <span className={storeStyles.pricingPrice}>{activePrice}</span>
                <span className={storeStyles.pricingPeriod}>
                  /{lang === "ar" ? "شهر" : "mo"}
                </span>
              </div>
              <ul className={storeStyles.pricingFeatures}>
                {features.map((feat: any, fIdx: number) => (
                  <li key={fIdx}>
                    <span className={storeStyles.pricingCheck}>✓</span>
                    {resolveLocalizedText(feat, lang)}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.buttonLink || "/store"}
                className={`glowButton ${storeStyles.pricingButton}`}
              >
                {resolveLocalizedText(plan.buttonText, lang) ||
                  (lang === "ar" ? "ابدأ الآن" : "Get Started")}
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

