"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import styles from "./BlogComponents.module.css";

export default function HeroSection() {
  const { t, lang } = useApp();

  return (
    <section className={`${styles.hero} animateFadeUp`}>
      <div className={styles.heroGlow}></div>
      <div className={styles.heroContent}>
        <span className={styles.badge}>{t.blog}</span>
        <h1>
          {lang === "ar"
            ? "اكتشف الأفكار التي تلهمك وتنمي مهاراتك"
            : "Discover Ideas That Inspire Your Journey"}
        </h1>
        <p>
          {lang === "ar"
            ? "مقالات متخصصة يكتبها خبراء لمساعدتك على التفوق في مجالات البرمجة، التصميم، ونمط الحياة الحديث."
            : "Insights and tutorials crafted by experts to help you excel in coding, modern design, and healthy lifestyle."}
        </p>
        <div className={styles.heroBtns}>
          <a href="#featured" className="glowButton">
            {lang === "ar" ? "ابدأ القراءة" : "Start Reading"}
          </a>
        </div>
      </div>
    </section>
  );
}
