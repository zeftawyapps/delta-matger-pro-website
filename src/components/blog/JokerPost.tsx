"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { BlogPost } from "@/types";
import { stripHtml } from "@/utils/html";
import styles from "./BlogComponents.module.css";

interface JokerPostProps {
  post?: BlogPost;
  posts?: BlogPost[];
  title?: string;
  description?: string;
  config?: {
    fullScreen?: boolean;
    imageCount?: number;
    margin?: number;
    boxedLayout?: boolean;
    hasShadow?: boolean;
  };
}

export default function JokerPost({ post, posts, title, description, config }: JokerPostProps) {
  const { t, lang, categories } = useApp();

  const imageCount = config?.imageCount ?? 1;
  const postList = (posts && posts.length > 0 ? posts : post ? [post] : [])
    .filter((p) => p.postType !== "page" && p.postType !== "intro");
  const activePosts = postList.slice(0, Math.max(1, imageCount));

  if (activePosts.length === 0) return null;

  const isFullScreen = config?.fullScreen === true;
  const isZeroMargin = config?.margin === 0;
  const isMulti = activePosts.length > 1;

  // Custom margin styling if specified
  const customSectionStyle: React.CSSProperties = {};
  if (config?.margin !== undefined) {
    customSectionStyle.margin = `${config.margin}px auto`;
    if (config.margin === 0) {
      customSectionStyle.padding = 0;
      customSectionStyle.maxWidth = "100%";
      customSectionStyle.width = "100%";
    }
  }

  const renderCard = (p: BlogPost, multi: boolean) => {
    const rawTitle = typeof p.title === "string" ? p.title : p.title?.[lang as any] || p.title?.ar || "";
    const titleStr = stripHtml(rawTitle);
    const descObj = p.seoDescription || (p as any).description;
    const rawDesc = typeof descObj === "string" ? descObj : descObj?.[lang as any] || descObj?.ar || "";
    const rawContent = typeof p.content === "string" ? p.content : p.content?.[lang as any] || p.content?.ar || "";
    const cleanDesc = stripHtml(rawDesc || rawContent);
    const fallbackDesc = cleanDesc.length > 160 ? cleanDesc.slice(0, 160) + "..." : cleanDesc;

    const imgUrl = p.imageUrl || (p as any).image || "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=1200";

    const dateVal = p.createdAt || (p as any).date || "";
    const dateStr = dateVal ? new Date(dateVal).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }) : "";

    const plainText = stripHtml(rawContent || rawDesc);
    const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = (p as any).readTime || (wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 220)) : 5);

    const categoryObj = categories.find((c) => c.id === p.blogCategoryId);
    const categoryName = categoryObj ? (categoryObj.name?.[lang as any] || categoryObj.name?.ar || "") : "";

    const cardHeightClass = multi
      ? isFullScreen
        ? styles.jokerMultiCardFullScreen
        : styles.jokerMultiCard
      : isFullScreen
      ? styles.jokerFullScreen
      : styles.jokerSplitCard;

    const edgeRadiusClass = isFullScreen && isZeroMargin ? styles.jokerCardFullScreenEdge : "";

    return (
      <div
        key={p.id}
        className={`${styles.jokerCard} ${cardHeightClass} ${edgeRadiusClass}`}
      >
        <img src={imgUrl} alt={titleStr} className={styles.jokerBgImage} />
        <div className={styles.jokerOverlay} />
        <div className={styles.jokerContent}>
          <div className={styles.jokerBadgeRow}>
            <span className={styles.jokerBadge}>
              ⚡ {categoryName || (lang === "ar" ? "مقال مميز" : "Featured Article")}
            </span>
          </div>
          <h2 className={multi ? styles.jokerMultiTitle : styles.jokerTitle}>{titleStr}</h2>
          {fallbackDesc && <p className={styles.jokerDesc}>{fallbackDesc}</p>}
          <div className={styles.jokerFooter}>
            <div className={styles.metaRow} style={{ color: "rgba(255, 255, 255, 0.85)" }}>
              {dateStr && (
                <span className={styles.cardMetaItem}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                    <line x1="16" x2="16" y1="2" y2="6"/>
                    <line x1="8" x2="8" y1="2" y2="6"/>
                    <line x1="3" x2="21" y1="10" y2="10"/>
                  </svg>
                  {dateStr}
                </span>
              )}
              <span className={styles.cardMetaItem}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                {readingTime} {t.minsRead}
              </span>
            </div>
            <Link href={`/blog/${p.slug}`} className="glowButton">
              {lang === "ar" ? "اقرأ المقال ←" : "Read Article →"}
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const sectionClass = `${styles.jokerSection} ${
    isFullScreen || isZeroMargin ? styles.jokerSectionFullScreen : ""
  } animateFadeUp`;

  return (
    <section className={sectionClass} style={customSectionStyle}>
      {(title || description) && (
        <div className={isFullScreen && isZeroMargin ? styles.jokerHeaderContainer : styles.jokerHeader}>
          {title && <h2 className={styles.sectionTitle}>{title}</h2>}
          {description && <p className={styles.sectionSubtitle}>{description}</p>}
        </div>
      )}
      {isMulti ? (
        <div className={`${styles.jokerMultiGrid} ${isFullScreen && isZeroMargin ? styles.jokerMultiGridFullScreen : ""}`}>
          {activePosts.map((p) => renderCard(p, true))}
        </div>
      ) : (
        renderCard(activePosts[0], false)
      )}
    </section>
  );
}
