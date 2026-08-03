"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatPrice } from "@/utils/currency";
import styles from "./StoreComponents.module.css";

interface PromotedOffersProps {
  variant?: string;
}

export default function PromotedOffers({ variant = "default" }: PromotedOffersProps) {
  const { offers, lang, organizationPolicy } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-play interval
  useEffect(() => {
    if (!offers || offers.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % offers.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [offers]);

  if (!offers || offers.length === 0) return null;

  const currentOffer = offers[activeIndex];
  const name = typeof currentOffer.name === "string"
    ? currentOffer.name
    : currentOffer.name?.[lang] || currentOffer.name?.ar || "";
  const description = typeof currentOffer.description === "string"
    ? currentOffer.description
    : currentOffer.description?.[lang] || currentOffer.description?.ar || "";

  // Dynamic link destination
  let ctaLink = "#";
  if (currentOffer.targetType === "product") {
    ctaLink = `/store/${currentOffer.targetId}`;
  } else if (currentOffer.targetType === "category") {
    ctaLink = `/store?category=${currentOffer.targetId}`;
  } else if (currentOffer.targetType === "external") {
    ctaLink = currentOffer.targetId || "#";
  }

  const isRtl = lang === "ar";

  // Mode 1: hero_slide (Full width banner/hero presentation)
  if (variant === "hero_slide") {
    return (
      <section className={`${styles.offersSection} ${styles.heroSlideContainer} animateFadeUp`}>
        <div 
          className={styles.heroSlideBox} 
          style={{ backgroundImage: currentOffer.imageUrl ? `url(${currentOffer.imageUrl})` : 'none' }}
        >
          <div className={styles.heroSlideOverlay}>
            <div className={styles.heroSlideContent}>
              {currentOffer.discountPercentage && (
                <span className={styles.offersBadge}>
                  {lang === "ar" ? `خصم ${currentOffer.discountPercentage}%` : `${currentOffer.discountPercentage}% OFF`}
                </span>
              )}
              <h3>{name}</h3>
              <p>{description}</p>
              <Link href={ctaLink} className="glowButton">
                {lang === "ar" ? "اكتشف العرض الآن" : "Discover Offer Now"}
              </Link>
            </div>
          </div>
          
          {/* Navigation bullets */}
          {offers.length > 1 && (
            <div className={styles.sliderDots}>
              {offers.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`${styles.sliderDot} ${activeIndex === idx ? styles.activeDot : ""}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Mode 2: default (Split layout card slider)
  return (
    <section className={`${styles.offersSection} animateFadeUp`}>
      <div className={`${styles.offersBox} glassCard`}>
        <div className={styles.sliderGrid}>
          <div 
            className={styles.offersContent}
            style={{ 
              textAlign: isRtl ? "right" : "left", 
              alignItems: isRtl ? "flex-start" : "flex-start" 
            }}
          >
            {currentOffer.discountPercentage && (
              <span className={styles.offersBadge}>
                {lang === "ar" ? `خصم ${currentOffer.discountPercentage}%` : `${currentOffer.discountPercentage}% OFF`}
              </span>
            )}
            <h3>{name}</h3>
            <p>{description}</p>

            <Link href={ctaLink} className="glowButton" style={{ marginTop: "1rem" }}>
              {lang === "ar" ? "اغتنم الفرصة الآن" : "Claim Offer Now"}
            </Link>
          </div>

          {currentOffer.imageUrl && (
            <div className={styles.sliderImageWrapper}>
              <img src={currentOffer.imageUrl} alt={name} className={styles.sliderImage} />
            </div>
          )}
        </div>

        {/* Navigation bullets */}
        {offers.length > 1 && (
          <div className={styles.sliderDots}>
            {offers.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`${styles.sliderDot} ${activeIndex === idx ? styles.activeDot : ""}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
