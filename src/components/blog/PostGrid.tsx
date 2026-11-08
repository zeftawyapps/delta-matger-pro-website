"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { BlogPost } from "@/types";
import { stripHtml } from "@/utils/html";
import { resolveLocalizedText, buildCardStyleProps } from "@/utils/sectionHelpers";
import styles from "./BlogComponents.module.css";

interface PostGridProps {
  posts: BlogPost[];
  displayMode?: "grid" | "list" | "slider" | "slide" | "horizontal_list" | "horizontal" | "scroll" | string;
  config?: any;
}

export default function PostGrid({ posts, displayMode = "grid", config }: PostGridProps) {
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
  const cardStyleVars = buildCardStyleProps(config?.cardStyle || config);

  return (
    <section className={styles.gridSection} style={cardStyleVars as any}>
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

          const plainText = stripHtml(rawContent || rawDesc);
          const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
          const readingTime = (post as any).readTime || (wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 220)) : 5);

          const categoryObj = categories.find((c) => c.id === post.blogCategoryId);
          const categoryName = categoryObj ? (categoryObj.name?.[lang as any] || categoryObj.name?.ar || "") : "";
          const categoryUrl = post.blogCategoryId ? `/blog?category=${post.blogCategoryId}` : null;
          const rawSlug = typeof post.slug === "string" ? post.slug : ((post.slug as any)?.ar || (post.slug as any)?.en || post.id || "");
          const postSlug = (rawSlug || "").trim().replace(/^\/+/, "");
          const postUrl = `/blog/${postSlug}`;

          // Card Action Button Styling & Formatting
          const rawButtonType = config?.cardButtonType || config?.buttonType || config?.readMoreStyle || "material";
          const showButton = rawButtonType !== "none" && config?.showCardButton !== false;
          const buttonText =
            resolveLocalizedText(config?.cardButtonText || config?.buttonText, lang) ||
            resolveLocalizedText(post.ctaButtonText, lang) ||
            t.readMore;
          const buttonAlign = config?.cardButtonAlign || "start";

          const btnClass =
            rawButtonType === "text"
              ? styles.btn_text
              : rawButtonType === "outline"
              ? styles.btn_outline
              : styles.btn_material;

          const footerAlignClass =
            buttonAlign === "center"
              ? styles.align_center
              : buttonAlign === "end"
              ? styles.align_end
              : buttonAlign === "full"
              ? styles.align_full
              : styles.align_start;

          return (
            <article
              key={`${post.id}-${idx}`}
              className={`${styles.postCard} glassCard animateFadeUp`}
              style={cardStyleVars as any}
            >
              <div className={styles.cardImgWrapper}>
                <Link href={postUrl} className={styles.cardImgLink} aria-label={titleStr}>
                  <img src={imgUrl} alt={titleStr} className={styles.cardImg} loading="lazy" />
                  <div className={styles.cardImgOverlay} />
                </Link>
                {categoryName && (
                  categoryUrl ? (
                    <Link
                      href={categoryUrl}
                      className={styles.cardCategory}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {categoryName}
                    </Link>
                  ) : (
                    <span className={styles.cardCategory}>{categoryName}</span>
                  )
                )}
              </div>
              
              <div className={styles.cardBody}>
                <div className={styles.cardMeta}>
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
                  {dateStr && <span className={styles.cardMetaDot}>•</span>}
                  <span className={styles.cardMetaItem}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {readingTime} {t.minsRead}
                  </span>
                </div>

                <Link href={postUrl} className={styles.cardTitleLink}>
                  <h3 className={styles.cardTitle}>{titleStr}</h3>
                </Link>

                {fallbackDesc && <p className={styles.cardSnippet}>{fallbackDesc}</p>}

                {showButton && (
                  <div className={`${styles.cardFooter} ${footerAlignClass}`}>
                    <Link href={postUrl} className={btnClass}>
                      <span>{buttonText}</span>
                      <svg className={styles.readMoreArrow} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        {lang === "ar" ? (
                          <path d="M19 12H5M12 19l-7-7 7-7" />
                        ) : (
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        )}
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
