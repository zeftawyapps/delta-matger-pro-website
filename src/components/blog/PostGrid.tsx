"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { BlogPost } from "@/types";
import styles from "./BlogComponents.module.css";

interface PostGridProps {
  posts: BlogPost[];
  displayMode?: "grid" | "list" | "slider" | "slide" | string;
}

export default function PostGrid({ posts, displayMode = "grid" }: PostGridProps) {
  const { lang, t, categories } = useApp();

  const modeClass =
    displayMode === "list"
      ? styles.listMode
      : displayMode === "scroll" || displayMode === "slider" || displayMode === "slide"
      ? styles.sliderMode
      : "";

  return (
    <section className={styles.gridSection}>
      <div className={`${styles.postsGrid} ${modeClass}`}>
        {posts.map((post, idx) => {
          const titleStr = typeof post.title === "string" ? post.title : post.title?.[lang as any] || post.title?.ar || "";
          const descObj = post.seoDescription || (post as any).description;
          const descStr = typeof descObj === "string" ? descObj : descObj?.[lang as any] || descObj?.ar || "";
          const fallbackDesc = descStr || (typeof post.content === "string" ? post.content : post.content?.[lang as any] || post.content?.ar || "").slice(0, 100) + "...";
          
          const imgUrl = post.imageUrl || (post as any).image || "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800";
          
          const dateVal = post.createdAt || (post as any).date || "";
          const dateStr = dateVal ? new Date(dateVal).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }) : "";

          const readingTime = (post as any).readTime || 5;

          const categoryObj = categories.find((c) => c.id === post.blogCategoryId);
          const categoryName = categoryObj ? (categoryObj.name?.[lang as any] || categoryObj.name?.ar || "") : "";

          const authorName = (post as any).author?.name?.[lang] || (post as any).author?.name || (lang === "ar" ? "الكاتب" : "Author");
          const authorAvatar = (post as any).author?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";

          return (
            <div key={`${post.id}-${idx}`} className={`${styles.postCard} ${ (post as any).isBestSeller || (post as any).isFeatured ? styles.smallCard : '' } glassCard animateFadeUp`}>
              <div className={styles.cardImgWrapper}>
                <img src={imgUrl} alt={titleStr} className={styles.cardImg} />
                {categoryName && <span className={styles.cardCategory}>{categoryName}</span>}
              </div>
              
              <div className={styles.cardBody}>
                <div className={styles.cardMeta}>
                  {dateStr && <span>📅 {dateStr}</span>}
                  <span>⏱ {readingTime} {t.minsRead}</span>
                </div>
                <h3 className={styles.cardTitle}>{titleStr}</h3>
                <p className={styles.cardSnippet}>{fallbackDesc}</p>
                
                <div className={styles.cardDivider}></div>
                
                <div className={styles.cardFooter}>

                  <Link href={`/blog/${post.slug}`} className={styles.readMoreBtn}>
                    {t.readMore} {lang === "ar" ? "←" : "→"}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
