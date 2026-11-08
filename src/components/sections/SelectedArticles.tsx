"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { resolveLocalizedText } from "@/utils/sectionHelpers";
import SectionHeader from "@/components/common/SectionHeader";
import { LocalizedString } from "@/types";
import styles from "./Sections.module.css";

export interface SelectedArticleItem {
  title: string | LocalizedString;
  imageUrl?: string;
  linkUrl: string;
  badge?: string | LocalizedString;
  description?: string | LocalizedString;
}

export interface SelectedArticlesProps {
  title?: string | LocalizedString;
  description?: string | LocalizedString;
  displayMode?: "horizontal_list" | "grid" | "slider" | string;
  config?: {
    autoPlay?: boolean;
    duration?: number;
    items?: SelectedArticleItem[];
    [key: string]: any;
  };
}

export default function SelectedArticles({
  title,
  description,
  displayMode = "horizontal_list",
  config = {},
}: SelectedArticlesProps) {
  const { lang } = useApp();
  const rawItems = Array.isArray(config.items) ? config.items : [];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const mode = displayMode || config.displayMode || "horizontal_list";
  const autoPlay = config.autoPlay === true;
  const duration = typeof config.duration === "number" && config.duration > 0 ? config.duration * 1000 : 4500;

  // AutoPlay logic for slider mode
  useEffect(() => {
    if (mode !== "slider" || !autoPlay || rawItems.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setSliderIndex((prev) => (prev + 1) % rawItems.length);
    }, duration);

    return () => clearInterval(timer);
  }, [mode, autoPlay, rawItems.length, duration, isHovered]);

  if (rawItems.length === 0) return null;

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const isRtl = lang === "ar";
    // In RTL, left arrow scrolls positive or negative depending on browser
    const scrollAmount = 320;
    const factor = direction === "right" ? 1 : -1;
    const delta = isRtl ? -factor * scrollAmount : factor * scrollAmount;
    scrollRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  const handlePrevSlide = () => {
    setSliderIndex((prev) => (prev - 1 + rawItems.length) % rawItems.length);
  };

  const handleNextSlide = () => {
    setSliderIndex((prev) => (prev + 1) % rawItems.length);
  };

  const renderCard = (article: SelectedArticleItem, idx: number) => {
    const titleStr = resolveLocalizedText(article.title, lang);
    const descStr = resolveLocalizedText(article.description, lang);
    const badgeStr = resolveLocalizedText(article.badge, lang);
    const targetUrl = article.linkUrl || "#";
    const isExternal = targetUrl.startsWith("http://") || targetUrl.startsWith("https://");

    const cardContent = (
      <div className={styles.selectedArticleCard}>
        {/* Cover Image Container */}
        <div className={styles.selectedArticleImgWrapper}>
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={titleStr}
              className={styles.selectedArticleImg}
              loading="lazy"
            />
          ) : (
            <div className={styles.selectedArticleImgPlaceholder}>
              <span className={styles.selectedArticleIcon}>📰</span>
            </div>
          )}

          {/* Badge Overlay */}
          {badgeStr && (
            <span className={styles.selectedArticleBadge}>
              {badgeStr}
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className={styles.selectedArticleBody}>
          <h3 className={styles.selectedArticleTitle}>
            {titleStr}
          </h3>

          {descStr && (
            <p className={styles.selectedArticleDesc}>
              {descStr}
            </p>
          )}

          <div className={styles.selectedArticleAction}>
            <span>{lang === "ar" ? "قراءة المقال" : "Read Article"}</span>
            <span className={styles.selectedArticleArrow}>
              {lang === "ar" ? "←" : "→"}
            </span>
          </div>
        </div>
      </div>
    );

    if (isExternal) {
      return (
        <a
          key={idx}
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.selectedArticleLink}
        >
          {cardContent}
        </a>
      );
    }

    return (
      <Link
        key={idx}
        href={targetUrl}
        className={styles.selectedArticleLink}
      >
        {cardContent}
      </Link>
    );
  };

  return (
    <section className={`${styles.sectionContainer} ${styles.selectedArticlesSection}`}>
      <SectionHeader
        title={title}
        subtitle={description}
        config={config}
      />

      {/* 1. HORIZONTAL LIST MODE */}
      {mode === "horizontal_list" && (
        <div className={styles.horizontalListWrapper}>
          <button
            type="button"
            className={`${styles.scrollNavBtn} ${styles.scrollPrevBtn}`}
            onClick={() => handleScroll("left")}
            aria-label={lang === "ar" ? "السابق" : "Previous"}
          >
            {lang === "ar" ? "→" : "←"}
          </button>

          <div
            ref={scrollRef}
            className={styles.horizontalScrollContainer}
          >
            {rawItems.map((article, idx) => renderCard(article, idx))}
          </div>

          <button
            type="button"
            className={`${styles.scrollNavBtn} ${styles.scrollNextBtn}`}
            onClick={() => handleScroll("right")}
            aria-label={lang === "ar" ? "التالي" : "Next"}
          >
            {lang === "ar" ? "←" : "→"}
          </button>
        </div>
      )}

      {/* 2. GRID MODE */}
      {mode === "grid" && (
        <div className={styles.selectedArticlesGrid}>
          {rawItems.map((article, idx) => renderCard(article, idx))}
        </div>
      )}

      {/* 3. SLIDER MODE */}
      {mode === "slider" && (
        <div
          className={styles.sliderWrapper}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={styles.sliderTrackWrapper}>
            <div
              className={styles.sliderTrack}
              style={{
                transform: `translateX(${lang === "ar" ? sliderIndex * 100 : -sliderIndex * 100}%)`,
              }}
            >
              {rawItems.map((article, idx) => (
                <div key={idx} className={styles.sliderSlide}>
                  {renderCard(article, idx)}
                </div>
              ))}
            </div>
          </div>

          {rawItems.length > 1 && (
            <>
              <button
                type="button"
                className={`${styles.sliderNavBtn} ${styles.sliderPrevBtn}`}
                onClick={handlePrevSlide}
                aria-label={lang === "ar" ? "السابق" : "Previous"}
              >
                {lang === "ar" ? "→" : "←"}
              </button>

              <button
                type="button"
                className={`${styles.sliderNavBtn} ${styles.sliderNextBtn}`}
                onClick={handleNextSlide}
                aria-label={lang === "ar" ? "التالي" : "Next"}
              >
                {lang === "ar" ? "←" : "→"}
              </button>

              <div className={styles.sliderDots}>
                {rawItems.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`${styles.sliderDot} ${idx === sliderIndex ? styles.sliderDotActive : ""}`}
                    onClick={() => setSliderIndex(idx)}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

