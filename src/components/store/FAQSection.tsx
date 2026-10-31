"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { mockFaqs } from "@/data/mockData";
import { getSectionHeaderTexts, resolveLocalizedText } from "@/utils/sectionHelpers";
import styles from "./StoreComponents.module.css";

interface FAQSectionProps {
  items?: any[];
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
}

export default function FAQSection({ items, title, description }: FAQSectionProps) {
  const { lang } = useApp();
  const { titleText, descText, hasHeader } = getSectionHeaderTexts({ title, description }, lang);
  const list = items && items.length > 0 ? items : mockFaqs;

  return (
    <section className={`${styles.faqSection} animateFadeUp`}>
      {hasHeader && (
        <div className={styles.landingSectionHeader}>
          {titleText && <h2 className={styles.sectionTitle}>{titleText}</h2>}
          {descText && <p className={styles.sectionSubtitle}>{descText}</p>}
        </div>
      )}
      <div className={styles.faqList}>
        {list.map((faq, index) => {
          const questionStr = resolveLocalizedText(faq.question || faq.title, lang);
          const answerStr = resolveLocalizedText(faq.answer || faq.description, lang);
          return (
            <details key={faq.id || index} className={`${styles.faqItem} glassCard attractiveCard`}>
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
