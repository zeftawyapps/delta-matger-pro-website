"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";
import { mockTestimonials } from "@/data/mockData";
import { getSectionHeaderTexts, resolveLocalizedText } from "@/utils/sectionHelpers";
import SectionHeader from "@/components/common/SectionHeader";
import styles from "./StoreComponents.module.css";

interface TestimonialsProps {
  items?: any[];
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  config?: any;
}

export default function Testimonials({ items, title, description, config }: TestimonialsProps) {
  const { lang, config: appConfig } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);
  const [apiItems, setApiItems] = useState<any[]>([]);
  const { titleText, descText } = getSectionHeaderTexts({ title, description }, lang);

  const source = config?.source || (items && items.length > 0 ? "manual" : "approved_feedback");
  const orgId = (appConfig as any)?.id || (appConfig as any)?.organizationId || "";

  useEffect(() => {
    let active = true;
    if (source === "approved_feedback" && orgId) {
      api
        .getApprovedFeedback(orgId, {
          type: config?.feedbackType || "all",
          limit: config?.limit || 10,
        })
        .then((res) => {
          if (active && Array.isArray(res) && res.length > 0) {
            setApiItems(
              res.map((r: any) => ({
                name: r.userName || (lang === "ar" ? "عميل موثق" : "Verified Client"),
                role: r.subject || "",
                feedback: r.comment || "",
                rating: typeof r.rating === "number" ? r.rating : 5,
                avatar: r.avatar || r.imageUrl,
              }))
            );
          }
        });
    }
    return () => {
      active = false;
    };
  }, [source, orgId, config?.feedbackType, config?.limit, lang]);

  const list =
    source === "approved_feedback" && apiItems.length > 0
      ? apiItems
      : items && items.length > 0
        ? items
        : mockTestimonials;

  if (list.length === 0) return null;

  const safeIndex = activeIndex < list.length ? activeIndex : 0;

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % list.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + list.length) % list.length);
  };

  const currentItem = list[safeIndex] || list[0];
  const userName = resolveLocalizedText(currentItem.name, lang);
  const userRole = resolveLocalizedText(currentItem.role, lang);
  const feedbackText = resolveLocalizedText(currentItem.feedback || currentItem.comment || currentItem.text, lang);
  const ratingCount = Math.min(5, Math.max(1, Math.round(Number(currentItem.rating) || 5)));
  const starsText = "★".repeat(ratingCount) + "☆".repeat(5 - ratingCount);
  const avatarUrl = currentItem.avatar || currentItem.imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";

  return (
    <section className={`${styles.testimonialsSection} animateFadeUp`}>
      <SectionHeader
        title={titleText}
        subtitle={descText}
        config={config}
      />
      <div className={`${styles.testimonialsBox} glassCard attractiveCard`}>
        <button onClick={prevSlide} className={styles.sliderArrow} aria-label="Previous Testimonial">
          {lang === "ar" ? "→" : "←"}
        </button>

        <div className={styles.testimonialContent}>
          <div className={styles.avatarWrapper}>
            <img src={avatarUrl} alt={userName} className={styles.userAvatar} />
          </div>
          <div className={styles.ratingStars}>{starsText}</div>
          <p className={styles.feedbackText}>&quot;{feedbackText}&quot;</p>
          <strong className={styles.userName}>{userName}</strong>
          {userRole && <span className={styles.userRole}>{userRole}</span>}
        </div>

        <button onClick={nextSlide} className={styles.sliderArrow} aria-label="Next Testimonial">
          {lang === "ar" ? "←" : "→"}
        </button>
      </div>

      <div className={styles.dotsRow}>
        {list.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`${styles.dot} ${safeIndex === idx ? styles.activeDot : ""}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
