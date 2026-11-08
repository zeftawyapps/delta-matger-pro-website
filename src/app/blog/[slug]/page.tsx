"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";
import { Product } from "@/types";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { isHtml, stripHtml } from "@/utils/html";
import { resolveLocalizedText } from "@/utils/sectionHelpers";
import styles from "./PostPage.module.css";

interface Comment {
  name: string;
  text: string;
  date: string;
}

const getPostId = (p: any): string => {
  if (!p) return "";
  if (typeof p.id === "string") return p.id;
  if (typeof p.blogPostId === "string") return p.blogPostId;
  if (p.meta?.id && typeof p.meta.id === "string") return p.meta.id;
  if (p._id) {
    if (typeof p._id === "string") return p._id;
    if (typeof p._id === "object" && typeof p._id.$oid === "string") return p._id.$oid;
  }
  return String(p.id || "");
};

export default function BlogPostContent() {
  const params = useParams<{ slug: string }>();
  const rawParam = params?.slug;
  const rawSlug = Array.isArray(rawParam) ? rawParam[0] : (rawParam || "");
  let decodedSlug = "";
  try {
    decodedSlug = decodeURIComponent(rawSlug);
  } catch {
    decodedSlug = rawSlug;
  }
  const slug = decodedSlug;
  const { lang, t, posts, categories, products, addToCart, loading, config } = useApp();
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);

  const showComments = false; // Hidden per user request
  const [scrollProgress, setScrollProgress] = useState(0);
  const [comments, setComments] = useState<Comment[]>([
    {
      name: lang === "ar" ? "أحمد علي" : "Ahmed Ali",
      text: lang === "ar" ? "مقال رائع ومفيد جداً، شكراً لك!" : "Very informative article, thank you!",
      date: "2026-06-16",
    },
  ]);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Find the post from active state posts list (robust matching for Arabic slugs, URL-encoded strings, and IDs)
  const norm = (s: string) => {
    try {
      return decodeURIComponent(s || "").trim().toLowerCase().replace(/^\/+/, "");
    } catch {
      return (s || "").trim().toLowerCase().replace(/^\/+/, "");
    }
  };
  const targetNorm = norm(decodedSlug);
  const rawTargetNorm = norm(rawSlug);

  const post = posts.find((p) => {
    if (p.postType === "page" || p.postType === "intro") return false;
    const rawPSlug = typeof p.slug === "string" ? p.slug : ((p.slug as any)?.ar || (p.slug as any)?.en || "");
    const pSlug = (rawPSlug || "").trim().replace(/^\/+/, "");
    const pId = getPostId(p).trim();

    return (
      (pSlug && (
        pSlug === decodedSlug ||
        pSlug === rawSlug ||
        norm(pSlug) === targetNorm ||
        norm(pSlug) === rawTargetNorm
      )) ||
      (pId && (
        pId === decodedSlug ||
        pId === rawSlug ||
        norm(pId) === targetNorm ||
        norm(pId) === rawTargetNorm
      ))
    );
  });

  // Calculate reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter related posts (exclude current and exclude pages/intros)
  const currentPostId = post ? getPostId(post) : "";
  const relatedPosts = posts
    .filter((p) => {
      if (p.postType === "page" || p.postType === "intro") return false;
      const pId = getPostId(p);
      const rawPSlug = typeof p.slug === "string" ? p.slug : ((p.slug as any)?.ar || (p.slug as any)?.en || "");
      const pSlug = (rawPSlug || "").trim().replace(/^\/+/, "");
      return pId !== currentPostId && pSlug !== slug && pSlug !== decodedSlug;
    })
    .slice(0, 2);

  const extractId = (item: any): string => {
    if (!item) return "";
    if (typeof item === "string") return item.trim();
    if (typeof item === "object") {
      return (item.id || item._id || item.productId || item.$oid || (item._id && item._id.$oid) || "").toString().trim();
    }
    return String(item).trim();
  };

  // Collect raw linked product IDs & already populated product objects
  const rawReferences = post
    ? [
        post.linkedProductId,
        (post as any).productId,
        ...(Array.isArray(post.relatedProducts) ? post.relatedProducts : []),
        ...(Array.isArray((post as any).products) ? (post as any).products : []),
        ...(Array.isArray((post as any).productIds) ? (post as any).productIds : []),
      ].filter(Boolean)
    : [];

  const populatedProducts: Product[] = [];
  const referencedIds: string[] = [];

  rawReferences.forEach((item) => {
    if (item && typeof item === "object" && (item.name || item.title) && (item.price !== undefined || item.imageUrl || item.images)) {
      populatedProducts.push(item as Product);
    } else {
      const id = extractId(item);
      if (id && !referencedIds.includes(id)) {
        referencedIds.push(id);
      }
    }
  });

  // Fetch any missing products if not already in state
  useEffect(() => {
    if (referencedIds.length === 0) return;
    const missingIds = referencedIds.filter((id) => {
      const inContext = products.some((p) => {
        const pId = extractId(p.id) || extractId((p as any)._id);
        return pId === id;
      });
      const inFetched = fetchedProducts.some((p) => {
        const pId = extractId(p.id) || extractId((p as any)._id);
        return pId === id;
      });
      return !inContext && !inFetched;
    });

    if (missingIds.length === 0) return;

    let isMounted = true;
    Promise.all(missingIds.map((id) => api.getProduct(id).catch(() => null))).then((results) => {
      if (!isMounted) return;
      const valid = results.filter((p): p is Product => p !== null);
      if (valid.length > 0) {
        setFetchedProducts((prev) => [...prev, ...valid]);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [referencedIds.join(",")]);

  const allAvailableProducts = [...products, ...fetchedProducts, ...populatedProducts];
  const resolvedProducts: Product[] = [];
  const seenIds = new Set<string>();

  populatedProducts.forEach((p) => {
    const pId = extractId(p.id) || extractId((p as any)._id) || JSON.stringify(p.name);
    if (!seenIds.has(pId)) {
      seenIds.add(pId);
      resolvedProducts.push(p);
    }
  });

  referencedIds.forEach((id) => {
    if (seenIds.has(id)) return;
    const matched = allAvailableProducts.find((p) => {
      const pId = extractId(p.id) || extractId((p as any)._id);
      return pId === id;
    });
    if (matched) {
      seenIds.add(id);
      resolvedProducts.push(matched);
    }
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentName.trim() && commentText.trim()) {
      const newComment: Comment = {
        name: commentName,
        text: commentText,
        date: new Date().toISOString().split("T")[0],
      };
      setComments([...comments, newComment]);
      setCommentName("");
      setCommentText("");
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 3000);
    }
  };

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert(lang === "ar" ? "تم نسخ الرابط!" : "Link copied to clipboard!");
    }
  };

  // If loading data initially, show clean loading view
  if (loading && !post) {
    return (
      <div className={styles.wrapper}>
        <Navbar />
        <main className={styles.main} style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div className="spinner" style={{ margin: "0 auto 1.5rem" }} />
            <p style={{ opacity: 0.7 }}>{lang === "ar" ? "جاري تحميل المقال..." : "Loading article..."}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.wrapper}>
        <Navbar />
        <div className={styles.notFound}>
          <h2>{lang === "ar" ? "المقال غير موجود" : "Article not found"}</h2>
          <Link href="/blog" className="glowButton">
            {lang === "ar" ? "العودة للمدونة" : "Back to Blog"}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Resilient parsing
  const titleStr = resolveLocalizedText(post.title, lang) || (typeof post.title === "string" ? stripHtml(post.title) : "");
  const descStr = resolveLocalizedText(post.seoDescription || (post as any).description, lang);
  const contentVal = resolveLocalizedText(post.content, lang) || (typeof post.content === "string" ? post.content : (post.content as any)?.ar || (post.content as any)?.en || "");
  const contentStr = typeof contentVal === "string" ? contentVal : "";
  const isHtmlContent = isHtml(contentStr);
  
  const imgUrl = post.imageUrl || (post as any).image || "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800";
  
  const rawDate = post.createdAt || (post as any).date || (post as any).meta?.createdAt;
  const dateVal = typeof rawDate === "object" && rawDate?.$date ? rawDate.$date : rawDate;
  let dateStr = "";
  if (dateVal) {
    try {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        dateStr = d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
    } catch {
      dateStr = "";
    }
  }

  const plainText = stripHtml(contentStr);
  const readingTime = (post as any).readTime || Math.max(1, Math.ceil(plainText.trim().split(/\s+/).filter(Boolean).length / 220));

  const categoryObj = categories.find((c) => c.id === post.blogCategoryId);
  const categoryName = categoryObj
    ? (typeof categoryObj.name === "string" ? categoryObj.name : resolveLocalizedText(categoryObj.name, lang))
    : "";

  const rawAuthor = (post as any).author;
  const authorName = typeof rawAuthor === "string"
    ? rawAuthor
    : resolveLocalizedText(rawAuthor?.name, lang) || (lang === "ar" ? "الكاتب" : "Author");
  const authorAvatar = (post as any).author?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";

  const showAuthor =
    (post as any).showAuthor === true ||
    (config?.website as any)?.showAuthor === true ||
    (config?.website as any)?.blog?.showAuthor === true;

  const rawCtaLink = typeof post.ctaButtonLink === "string" ? post.ctaButtonLink.trim() : "";
  const ctaBtnText =
    resolveLocalizedText(post.ctaButtonText, lang) ||
    (lang === "ar" ? "الانتقال للمتجر" : "Go to Store");
  const isCtaExternal =
    rawCtaLink.startsWith("http://") ||
    rawCtaLink.startsWith("https://") ||
    rawCtaLink.startsWith("//");

  return (
    <div className={styles.wrapper}>
      {/* Top Reading Progress Bar */}
      <div className={styles.progressContainer}>
        <div className={styles.progressBar} style={{ width: `${scrollProgress}%` }} />
      </div>

      <Navbar />

      <main className={`${styles.main} ${lang === "ar" ? styles.rtl : styles.ltr}`}>
        {/* Article Header */}
        <header className={styles.header}>
          <div className={styles.metaTop}>
            {categoryName && <span className={styles.category}>{categoryName}</span>}
            {dateStr && <span className={styles.metaItem}>📅 {dateStr}</span>}
            <span className={styles.metaItem}>⏱ {readingTime} {t.minsRead}</span>
          </div>
          <h1>{titleStr}</h1>
          
          {showAuthor && (
            <div className={styles.authorBar}>
              <img src={authorAvatar} alt={authorName} className={styles.avatar} />
              <div className={styles.authorMeta}>
                <strong>{authorName}</strong>
                <span>{t.author}</span>
              </div>
            </div>
          )}
        </header>

        {/* Hero Image */}
        <div className={styles.heroImageWrapper}>
          <img src={imgUrl} alt={titleStr} className={styles.heroImage} />
        </div>

        {/* Content & Sidebar Layout */}
        <div className={styles.contentLayout}>
          {/* Main Article Body */}
          <article className={styles.articleBody}>
            {descStr && <p className={styles.leadParagraph}>{descStr}</p>}
            {isHtmlContent ? (
              <div
                className={styles.articleContentHtml}
                dangerouslySetInnerHTML={{ __html: contentStr }}
              />
            ) : (
              contentStr.split("\n\n").map((paragraph, idx) => (
                <p key={idx} className={styles.paragraph}>
                  {paragraph}
                </p>
              ))
            )}

            {/* Linked Products Section (Single or Multiple) */}
            {resolvedProducts.length > 0 && (
              <section className={styles.relatedProductsSection}>
                <div className={styles.relatedProductsHeader}>
                  <span>✨</span>
                  <span>{lang === "ar" ? "المنتجات المرتبطة بهذا المقال" : "Featured Products in this Article"}</span>
                </div>

                {resolvedProducts.length === 1 ? (
                  (() => {
                    const prod = resolvedProducts[0];
                    const prodName = typeof prod.name === "string" ? prod.name : resolveLocalizedText(prod.name, lang);
                    const prodDesc = prod.description ? stripHtml(typeof prod.description === "string" ? prod.description : resolveLocalizedText(prod.description, lang)) : "";
                    const prodImg = (prod.images && prod.images[0]) || (prod as any).imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600";
                    const prodPrice = typeof prod.price === "number" ? prod.price : Number(prod.price) || 0;
                    const prodOldPrice = typeof prod.oldPrice === "number" ? prod.oldPrice : Number(prod.oldPrice) || 0;
                    
                    // Bind button to the link sent (rawCtaLink), whether internal or external
                    const targetBtnUrl = rawCtaLink || (prod.id ? `/store/${prod.id}` : "/store");
                    const isTargetExternal =
                      targetBtnUrl.startsWith("http://") ||
                      targetBtnUrl.startsWith("https://") ||
                      targetBtnUrl.startsWith("//");

                    return (
                      <div className={styles.productCtaCard}>
                        <div className={styles.productCtaBadge}>
                          ✨ {lang === "ar" ? "منتج مميز وموصى به" : "Featured Product"}
                        </div>
                        <div className={styles.productCtaBody}>
                          <div className={styles.productCtaImgWrapper}>
                            {isTargetExternal ? (
                              <a href={targetBtnUrl} target={post.ctaLinkTarget || "_blank"} rel="noopener noreferrer">
                                <img src={prodImg} alt={prodName} className={styles.productCtaImg} />
                              </a>
                            ) : (
                              <Link href={targetBtnUrl}>
                                <img src={prodImg} alt={prodName} className={styles.productCtaImg} />
                              </Link>
                            )}
                          </div>
                          <div className={styles.productCtaContent}>
                            <h3 className={styles.productCtaTitle}>
                              {isTargetExternal ? (
                                <a
                                  href={targetBtnUrl}
                                  target={post.ctaLinkTarget || "_blank"}
                                  rel="noopener noreferrer"
                                  style={{ color: "inherit", textDecoration: "none" }}
                                >
                                  {prodName}
                                </a>
                              ) : (
                                <Link href={targetBtnUrl} style={{ color: "inherit", textDecoration: "none" }}>
                                  {prodName}
                                </Link>
                              )}
                            </h3>
                            {prodDesc && <p className={styles.productCtaDesc}>{prodDesc}</p>}
                            <div className={styles.productCtaPriceRow}>
                              <span className={styles.productCtaPrice}>
                                {prodPrice} {lang === "ar" ? "ر.س" : "SAR"}
                              </span>
                              {prodOldPrice > prodPrice && (
                                <span className={styles.productCtaOldPrice}>
                                  {prodOldPrice} {lang === "ar" ? "ر.س" : "SAR"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className={styles.productCtaActions}>
                          {isTargetExternal ? (
                            <a
                              href={targetBtnUrl}
                              target={post.ctaLinkTarget || "_blank"}
                              rel="noopener noreferrer"
                              className={styles.productCtaBtn}
                            >
                              🛒 {ctaBtnText}
                            </a>
                          ) : (
                            <Link href={targetBtnUrl} className={styles.productCtaBtn}>
                              🛒 {ctaBtnText}
                            </Link>
                          )}
                          <button
                            onClick={() => addToCart(prod, 1)}
                            className={styles.productCtaAddToCartBtn}
                          >
                            + {lang === "ar" ? "إضافة سريعة للسلة" : "Add to Cart"}
                          </button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className={styles.relatedProductsGrid}>
                    {resolvedProducts.map((prod, idx) => {
                      const prodName = typeof prod.name === "string" ? prod.name : resolveLocalizedText(prod.name, lang);
                      const prodImg = (prod.images && prod.images[0]) || (prod as any).imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600";
                      const prodPrice = typeof prod.price === "number" ? prod.price : Number(prod.price) || 0;
                      const prodOldPrice = typeof prod.oldPrice === "number" ? prod.oldPrice : Number(prod.oldPrice) || 0;
                      
                      // Bind button to the product link or rawCtaLink, whether internal or external
                      const itemTargetUrl = (prod as any).ctaButtonLink || (prod as any).linkUrl || (rawCtaLink || (prod.id ? `/store/${prod.id}` : "/store"));
                      const isItemTargetExternal =
                        itemTargetUrl.startsWith("http://") ||
                        itemTargetUrl.startsWith("https://") ||
                        itemTargetUrl.startsWith("//");

                      return (
                        <div key={`${prod.id}-${idx}`} className={styles.relatedProductGridCard}>
                          <div className={styles.relatedProductGridImgWrapper}>
                            {isItemTargetExternal ? (
                              <a href={itemTargetUrl} target={post.ctaLinkTarget || "_blank"} rel="noopener noreferrer">
                                <img src={prodImg} alt={prodName} className={styles.relatedProductGridImg} loading="lazy" />
                              </a>
                            ) : (
                              <Link href={itemTargetUrl}>
                                <img src={prodImg} alt={prodName} className={styles.relatedProductGridImg} loading="lazy" />
                              </Link>
                            )}
                            {prodOldPrice > prodPrice && (
                              <span className={styles.relatedProductGridBadge}>
                                {lang === "ar" ? "خصم" : "Sale"}
                              </span>
                            )}
                          </div>
                          <div className={styles.relatedProductGridContent}>
                            {isItemTargetExternal ? (
                              <a
                                href={itemTargetUrl}
                                target={post.ctaLinkTarget || "_blank"}
                                rel="noopener noreferrer"
                                className={styles.relatedProductGridTitle}
                              >
                                {prodName}
                              </a>
                            ) : (
                              <Link href={itemTargetUrl} className={styles.relatedProductGridTitle}>
                                {prodName}
                              </Link>
                            )}
                            <div className={styles.relatedProductGridPriceRow}>
                              <span className={styles.relatedProductGridPrice}>
                                {prodPrice} {lang === "ar" ? "ر.س" : "SAR"}
                              </span>
                              {prodOldPrice > prodPrice && (
                                <span className={styles.relatedProductGridOldPrice}>
                                  {prodOldPrice} {lang === "ar" ? "ر.س" : "SAR"}
                                </span>
                              )}
                            </div>
                            <div className={styles.relatedProductGridActions}>
                              {isItemTargetExternal ? (
                                <a
                                  href={itemTargetUrl}
                                  target={post.ctaLinkTarget || "_blank"}
                                  rel="noopener noreferrer"
                                  className={styles.relatedProductGridBtn}
                                >
                                  {ctaBtnText}
                                </a>
                              ) : (
                                <Link href={itemTargetUrl} className={styles.relatedProductGridBtn}>
                                  {ctaBtnText}
                                </Link>
                              )}
                              <button
                                onClick={() => addToCart(prod, 1)}
                                className={styles.relatedProductGridCartBtn}
                                title={lang === "ar" ? "أضف للسلة" : "Add to Cart"}
                              >
                                + 🛒
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* Additional CTA / Action Link Banner if provided */}
            {rawCtaLink && (
              <div className={styles.actionBanner}>
                <div className={styles.actionBannerContent}>
                  <span className={styles.actionBannerIcon}>🚀</span>
                  <div className={styles.actionBannerText}>
                    {ctaBtnText}
                  </div>
                </div>
                {isCtaExternal ? (
                  <a
                    href={rawCtaLink}
                    target={post.ctaLinkTarget || "_blank"}
                    rel="noopener noreferrer"
                    className={styles.actionBannerBtn}
                  >
                    <span>{ctaBtnText}</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {lang === "ar" ? <path d="M19 12H5M12 19l-7-7 7-7" /> : <path d="M5 12h14M12 5l7 7-7 7" />}
                    </svg>
                  </a>
                ) : (
                  <Link href={rawCtaLink} className={styles.actionBannerBtn}>
                    <span>{ctaBtnText}</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {lang === "ar" ? <path d="M19 12H5M12 19l-7-7 7-7" /> : <path d="M5 12h14M12 5l7 7-7 7" />}
                    </svg>
                  </Link>
                )}
              </div>
            )}

            {/* Sharing Bar */}
            <div className={styles.shareBar}>
              <span>{lang === "ar" ? "مشاركة المقال:" : "Share Article:"}</span>
              <button onClick={copyShareLink} className={styles.shareBtn} title="Copy Link">
                🔗 {lang === "ar" ? "نسخ الرابط" : "Copy Link"}
              </button>
              <button className={styles.shareBtn} title="Twitter/X">🐦 Twitter</button>
              <button className={styles.shareBtn} title="Facebook">📘 Facebook</button>
            </div>
          </article>

          {/* Sidebar / Related Posts */}
          <aside className={styles.sidebar}>
            <div className={`${styles.sidebarBox} glassCard`}>
              <h3>{t.relatedPosts}</h3>
              <div className={styles.relatedList}>
                {relatedPosts.map((rPost) => {
                  const rTitle = resolveLocalizedText(rPost.title, lang) || (typeof rPost.title === "string" ? stripHtml(rPost.title) : "");
                  const rImg = rPost.imageUrl || (rPost as any).image || "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800";
                  const rTime = (rPost as any).readTime || 5;
                  const rSlug = rPost.slug || rPost.id;

                  return (
                    <Link href={`/blog/${rSlug}`} key={rPost.id} className={styles.relatedItem}>
                      <img src={rImg} alt={rTitle} className={styles.relatedImg} />
                      <div className={styles.relatedInfo}>
                        <h4>{rTitle}</h4>
                        <span>⏱ {rTime} {t.minsRead}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>

        {/* Comments Section (Hidden per user request) */}
        {showComments && (
          <>
            <div className={styles.sectionDivider}></div>
            <section className={styles.commentsSection}>
              <h2>{t.comments} ({comments.length})</h2>
              
              <div className={styles.commentsList}>
                {comments.map((comment, index) => (
                  <div key={index} className={`${styles.commentItem} glassCard`}>
                    <div className={styles.commentHeader}>
                      <strong>{comment.name}</strong>
                      <span>{comment.date}</span>
                    </div>
                    <p>{comment.text}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment Form */}
              <div className={`${styles.addCommentBox} glassCard`}>
                <h3>{t.addComment}</h3>
                <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                  <div className={styles.formRow}>
                    <input
                      type="text"
                      required
                      placeholder={t.commentNamePlaceholder}
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      className="customInput"
                    />
                  </div>
                  <textarea
                    required
                    rows={4}
                    placeholder={t.writeComment}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="customInput"
                    style={{ resize: "vertical" }}
                  />
                  {commentSuccess && <p className={styles.successMsg}>🎉 {t.commentSuccess}</p>}
                  <button type="submit" className="glowButton">
                    {t.postComment}
                  </button>
                </form>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
