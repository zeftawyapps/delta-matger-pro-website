"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { BlogPost } from "@/types";
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
  };
}

export default function JokerPost({ post, posts, title, description, config }: JokerPostProps) {
  const { t, lang, categories } = useApp();

  const imageCount = config?.imageCount ?? 1;
  const postList = posts && posts.length > 0 ? posts : post ? [post] : [];
  const activePosts = postList.slice(0, Math.max(1, imageCount));

  if (activePosts.length === 0) return null;

  const isFullScreen = config?.fullScreen !== false;

  const renderCard = (p: BlogPost, isMulti: boolean) => {
    const titleStr = typeof p.title === "string" ? p.title : p.title?.[lang as any] || p.title?.ar || "";
    const descObj = p.seoDescription || (p as any).description;
    const descStr = typeof descObj === "string" ? descObj : descObj?.[lang as any] || descObj?.ar || "";
    const fallbackDesc = descStr || (typeof p.content === "string" ? p.content : p.content?.[lang as any] || p.content?.ar || "").slice(0, 140) + "...";

    const imgUrl = p.imageUrl || (p as any).image || "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=1200";

    const dateVal = p.createdAt || (p as any).date || "";
    const dateStr = dateVal ? new Date(dateVal).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }) : "";

    const readingTime = (p as any).readTime || 5;

    const categoryObj = categories.find((c) => c.id === p.blogCategoryId);
    const categoryName = categoryObj ? (categoryObj.name?.[lang as any] || categoryObj.name?.ar || "") : "";

    return (
      <div
        key={p.id}
        className={`${styles.jokerCard} ${
          isMulti
            ? styles.jokerMultiCard
            : isFullScreen
            ? styles.jokerFullScreen
            : styles.jokerSplitCard
        }`}
      >
        <img src={imgUrl} alt={titleStr} className={styles.jokerBgImage} />
        <div className={styles.jokerOverlay} />
        <div className={styles.jokerContent}>
          <div className={styles.jokerBadgeRow}>
            <span className={styles.jokerBadge}>
              ⚡ {categoryName || (lang === "ar" ? "مقال مميز" : "Featured Article")}
            </span>
          </div>
          <h2 className={isMulti ? styles.jokerMultiTitle : styles.jokerTitle}>{titleStr}</h2>
          <p className={styles.jokerDesc}>{fallbackDesc}</p>
          <div className={styles.jokerFooter}>
            <div className={styles.metaRow} style={{ color: "rgba(255, 255, 255, 0.85)" }}>
              {dateStr && <span>📅 {dateStr}</span>}
              <span>⏱ {readingTime} {t.minsRead}</span>
            </div>
            <Link href={`/blog/${p.slug}`} className="glowButton">
              {lang === "ar" ? "اقرأ المقال ←" : "Read Article →"}
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const isMulti = activePosts.length > 1;

  return (
    <section className={`${styles.jokerSection} animateFadeUp`}>
      {(title || description) && (
        <div className={styles.jokerHeader}>
          {title && <h2 className={styles.sectionTitle}>{title}</h2>}
          {description && <p className={styles.sectionSubtitle}>{description}</p>}
        </div>
      )}
      {isMulti ? (
        <div className={styles.jokerMultiGrid}>
          {activePosts.map((p) => renderCard(p, true))}
        </div>
      ) : (
        renderCard(activePosts[0], false)
      )}
    </section>
  );
}
