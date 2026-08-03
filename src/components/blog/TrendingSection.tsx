"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { BlogPost } from "@/types";
import styles from "./BlogComponents.module.css";

interface TrendingSectionProps {
  posts: BlogPost[];
}

export default function TrendingSection({ posts }: TrendingSectionProps) {
  const { t, lang, categories } = useApp();

  return (
    <section className={`${styles.trendingSection} animateFadeUp`}>
      <div className={styles.sectionHeader}>
        <span className={styles.trendingIcon}>🔥</span>
        <h2>{t.trending}</h2>
      </div>
      <div className={styles.trendingGrid}>
        {posts.map((post, index) => {
          const titleStr = typeof post.title === "string" ? post.title : post.title?.[lang as any] || post.title?.ar || "";
          
          const dateVal = post.createdAt || (post as any).date || "";
          const dateStr = dateVal ? new Date(dateVal).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }) : "";

          const readingTime = (post as any).readTime || 5;

          const categoryObj = categories.find((c) => c.id === post.blogCategoryId);
          const categoryName = categoryObj ? (categoryObj.name?.[lang as any] || categoryObj.name?.ar || "") : "";

          return (
            <Link
              href={`/blog/${post.slug}`}
              key={`${post.id}-${index}`}
              className={`${styles.trendingCard} glassCard`}
            >
              <div className={styles.trendingNumber}>
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className={styles.trendingContent}>
                {categoryName && <span className={styles.trendingCategory}>{categoryName}</span>}
                <h4>{titleStr}</h4>
                <div className={styles.trendingMeta}>
                  {dateStr && <span>{dateStr}</span>}
                  <span>•</span>
                  <span>{readingTime} {t.minsRead}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
