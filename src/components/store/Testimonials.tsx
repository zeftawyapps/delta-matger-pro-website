"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { mockTestimonials } from "@/data/mockData";
import styles from "./StoreComponents.module.css";

export default function Testimonials() {
  const { lang, t } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % mockTestimonials.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + mockTestimonials.length) % mockTestimonials.length);
  };

  return (
    <section className={`${styles.testimonialsSection} animateFadeUp`}>
      <h2 className={styles.sectionTitle}>{t.testimonialsTitle}</h2>
      <div className={`${styles.testimonialsBox} glassCard`}>
        <button onClick={prevSlide} className={styles.sliderArrow} aria-label="Previous Testimonial">
          {lang === "ar" ? "→" : "←"}
        </button>

        <div className={styles.testimonialContent}>
          <div className={styles.avatarWrapper}>
            <img
              src={mockTestimonials[activeIndex].avatar}
              alt={mockTestimonials[activeIndex].name[lang as keyof typeof mockTestimonials[0]["name"]]}
              className={styles.userAvatar}
            />
          </div>
          <div className={styles.ratingStars}>★★★★★</div>
          <p className={styles.feedbackText}>&quot;{mockTestimonials[activeIndex].feedback[lang as keyof typeof mockTestimonials[0]["feedback"]]}&quot;</p>
          <strong className={styles.userName}>{mockTestimonials[activeIndex].name[lang as keyof typeof mockTestimonials[0]["name"]]}</strong>
          <span className={styles.userRole}>{mockTestimonials[activeIndex].role[lang as keyof typeof mockTestimonials[0]["role"]]}</span>
        </div>

        <button onClick={nextSlide} className={styles.sliderArrow} aria-label="Next Testimonial">
          {lang === "ar" ? "←" : "→"}
        </button>
      </div>

      <div className={styles.dotsRow}>
        {mockTestimonials.map((_, idx) => (
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
