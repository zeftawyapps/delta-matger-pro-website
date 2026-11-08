"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
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
  const { lang } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);
  const { titleText, descText, hasHeader } = getSectionHeaderTexts({ title, description }, lang);

  const list = items && items.length > 0 ? items : mockTestimonials;
  if (list.length === 0) return null;

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % list.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + list.length) % list.length);
  };

  const currentItem = list[activeIndex] || list[0];
  const userName = resolveLocalizedText(currentItem.name, lang);
  const userRole = resolveLocalizedText(currentItem.role, lang);
  const feedbackText = resolveLocalizedText(currentItem.feedback || currentItem.comment || currentItem.text, lang);
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
          <div className={styles.ratingStars}>★★★★★</div>
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
            className={`${styles.dot} ${activeIndex === idx ? styles.activeDot : ""}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
