"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { mockFaqs } from "@/data/mockData";
import { getSectionHeaderTexts, resolveLocalizedText } from "@/utils/sectionHelpers";
import SectionHeader from "@/components/common/SectionHeader";
import styles from "./StoreComponents.module.css";

interface FAQSectionProps {
  items?: any[];
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  config?: any;
}

export default function FAQSection({ items, title, description, config }: FAQSectionProps) {
  const { lang } = useApp();
  const { titleText, descText } = getSectionHeaderTexts({ title, description }, lang);
  const list = items && items.length > 0 ? items : mockFaqs;
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());

  const toggleItem = (idx: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <section className={`${styles.faqSection} animateFadeUp`}>
      <SectionHeader
        title={titleText}
        subtitle={descText}
        config={config}
      />
      <div className={styles.faqList}>
        {list.map((faq, index) => {
          const questionStr = resolveLocalizedText(faq.question || faq.title, lang);
          const answerStr = resolveLocalizedText(faq.answer || faq.description, lang);
          const isOpen = openIndices.has(index);
          const answerId = `faq-answer-${faq.id || index}`;

          return (
            <div
              key={faq.id || index}
              className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""} glassCard attractiveCard`}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => toggleItem(index)}
                className={styles.faqSummary}
              >
                <span>{questionStr}</span>
                <span className={styles.faqIcon} aria-hidden>+</span>
              </button>
              <div id={answerId} className={styles.faqAnswerWrapper}>
                <div className={styles.faqAnswerInner}>
                  <div className={styles.faqAnswer}>
                    <p>{answerStr}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
