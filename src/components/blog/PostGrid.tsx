"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { BlogPost } from "@/types";
import { stripHtml } from "@/utils/html";
import styles from "./BlogComponents.module.css";

interface PostGridProps {
  posts: BlogPost[];
  displayMode?: "grid" | "list" | "slider" | "slide" | "horizontal_list" | "horizontal" | "scroll" | string;
}

export default function PostGrid({ posts, displayMode = "grid" }: PostGridProps) {
  const { lang, t, categories } = useApp();

  const isSlider =
    displayMode === "scroll" ||
    displayMode === "slider" ||
    displayMode === "slide" ||
    displayMode === "horizontal_list" ||
    displayMode === "horizontal";

  const modeClass =
    displayMode === "list"
      ? styles.listMode
      : isSlider
      ? styles.sliderMode
      : "";

  // Ensure only actual blog posts are rendered (exclude static pages and intros)
  const validPosts = posts.filter((p) => p.postType !== "page" && p.postType !== "intro");

  return (
    <section className={styles.gridSection}>
      <div className={`${styles.postsGrid} ${modeClass}`}>
        {validPosts.map((post, idx) => {
          const rawTitle = typeof post.title === "string" ? post.title : post.title?.[lang as any] || post.title?.ar || "";
          const titleStr = stripHtml(rawTitle);
          const descObj = post.seoDescription || (post as any).description;
          const rawDesc = typeof descObj === "string" ? descObj : descObj?.[lang as any] || descObj?.ar || "";
          const rawContent = typeof post.content === "string" ? post.content : post.content?.[lang as any] || post.content?.ar || "";
          const cleanDesc = stripHtml(rawDesc || rawContent);
          const fallbackDesc = cleanDesc.length > 120 ? cleanDesc.slice(0, 120) + "..." : cleanDesc;
          
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
