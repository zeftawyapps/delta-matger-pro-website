"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { mockFaqs } from "@/data/mockData";
import styles from "./StoreComponents.module.css";

export default function FAQSection({ items }: { items?: any[] }) {
  const { lang, t } = useApp();
  const list = items && items.length > 0 ? items : mockFaqs;

  return (
    <section className={`${styles.faqSection} animateFadeUp`}>
      <h2 className={styles.sectionTitle}>{t.faqTitle}</h2>
      <div className={styles.faqList}>
        {list.map((faq, index) => {
          const questionStr = typeof faq.question === "string" 
            ? faq.question 
            : faq.question?.[lang] || faq.question?.ar || "";
          const answerStr = typeof faq.answer === "string" 
            ? faq.answer 
            : faq.answer?.[lang] || faq.answer?.ar || "";
          return (
            <details key={faq.id || index} className={`${styles.faqItem} glassCard`}>
              <summary className={styles.faqSummary}>
                <span>{questionStr}</span>
                <span className={styles.faqIcon}>+</span>
              </summary>
              <div className={styles.faqAnswer}>
                <p>{answerStr}</p>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
