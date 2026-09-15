"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { BlogPost } from "@/types";
import { stripHtml } from "@/utils/html";
import styles from "./BlogComponents.module.css";

interface FeaturedPostProps {
  post: BlogPost;
}

export default function FeaturedPost({ post }: FeaturedPostProps) {
  const { t, lang, categories } = useApp();

  if (!post || post.postType === "page" || post.postType === "intro") return null;

  // Resilient parsing
  const rawTitle = typeof post.title === "string" ? post.title : post.title?.[lang as any] || post.title?.ar || "";
  const titleStr = stripHtml(rawTitle);
  const descObj = post.seoDescription || (post as any).description;
  const rawDesc = typeof descObj === "string" ? descObj : descObj?.[lang as any] || descObj?.ar || "";
  const rawContent = typeof post.content === "string" ? post.content : post.content?.[lang as any] || post.content?.ar || "";
  const cleanDesc = stripHtml(rawDesc || rawContent);
  const fallbackDesc = cleanDesc.length > 180 ? cleanDesc.slice(0, 180) + "..." : cleanDesc;
  
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
    <section id="featured" className={`${styles.featuredSection} animateFadeUp`}>
      <div className={`${styles.featuredCard} glassCard`}>
        <div className={styles.featuredImageWrapper}>
          <img src={imgUrl} alt={titleStr} className={styles.featuredImage} />
          {categoryName && <span className={styles.categoryBadge}>{categoryName}</span>}
        </div>
        <div className={styles.featuredInfo}>
          <div className={styles.metaRow}>
            {dateStr && <span>📅 {dateStr}</span>}
            <span>⏱ {readingTime} {t.minsRead}</span>
          </div>
          <h3>{titleStr}</h3>
          <p className={styles.description}>{fallbackDesc}</p>
          
          <div className={styles.cardFooter}>
            <Link href={`/blog/${post.slug}`} className="glowButton">
              {t.readMore}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
