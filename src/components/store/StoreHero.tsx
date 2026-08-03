"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatPrice } from "@/utils/currency";
import styles from "./StoreComponents.module.css";

export default function StoreHero() {
  const { lang, organizationPolicy } = useApp();

  return (
    <section className={`${styles.hero} animateFadeUp`}>
      <div className={styles.heroGlow}></div>
      <div className={styles.heroGrid}>
        <div className={styles.heroContent}>
          <span className={styles.tagBadge}>⚡ {lang === "ar" ? "عرض خاص لفترة محدودة" : "Limited Time Special"}</span>
          <h1>
            {lang === "ar"
              ? "ارتقِ بتجربتك الرقمية اليوم"
              : "Elevate Your Digital Experience"}
          </h1>
          <p>
            {lang === "ar"
              ? "اكتشف تشكيلتنا الحصرية من الأجهزة والإكسسوارات والملابس الذكية بأحدث التقنيات وأفضل الأسعار."
              : "Discover our exclusive lineup of smart electronics, premium accessories, and apparel engineered for comfort."}
          </p>
          <div className={styles.heroPriceRow}>
            <span className={styles.originalPrice}>
              {formatPrice(249.00, organizationPolicy?.logistics?.currency, lang)}
            </span>
            <span className={styles.activePrice}>
              {formatPrice(199.99, organizationPolicy?.logistics?.currency, lang)}
            </span>
            <span className={styles.discountBadge}>20% OFF</span>
          </div>
          <div className={styles.heroBtns}>
            <Link href="/store/101" className="glowButton">
              {lang === "ar" ? "اشتري الآن" : "Shop Now"}
            </Link>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={`${styles.visualCard} glassCard`}>
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
              alt="Featured Wireless Headphones"
              className={styles.visualImg}
            />
            <div className={styles.visualFloatingTag}>
              <strong>ANC 40h</strong>
              <span>{lang === "ar" ? "إلغاء الضوضاء" : "Noise Cancellation"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
