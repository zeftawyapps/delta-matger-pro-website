"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { isHtml, stripHtml } from "@/utils/html";
import styles from "./PostPage.module.css";

interface Comment {
  name: string;
  text: string;
  date: string;
}

export default function BlogPostContent() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { lang, t, posts, categories } = useApp();

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

  // Find the post from active state posts list (ensure it is a post, not a page or intro)
  const post = posts.find((p) => p.slug === slug && p.postType !== "page" && p.postType !== "intro");

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
  const relatedPosts = posts.filter((p) => p.slug !== slug && p.postType !== "page" && p.postType !== "intro").slice(0, 2);

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

  if (!post) {
    return (
      <div className={styles.wrapper}>
        <Navbar />
        <div className={styles.notFound}>
          <h2>Article not found / المقال غير موجود</h2>
          <Link href="/blog" className="glowButton">
            Back to Blog / العودة للمدونة
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Resilient parsing
  const rawTitle = typeof post.title === "string" ? post.title : post.title?.[lang as any] || post.title?.ar || "";
  const titleStr = stripHtml(rawTitle);
  const descObj = post.seoDescription || (post as any).description;
  const rawDesc = typeof descObj === "string" ? descObj : descObj?.[lang as any] || descObj?.ar || "";
  const descStr = stripHtml(rawDesc);
  const contentStr = typeof post.content === "string" ? post.content : post.content?.[lang as any] || post.content?.ar || "";
  const isHtmlContent = isHtml(contentStr);
  
  const imgUrl = post.imageUrl || (post as any).image || "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800";
  
  const dateVal = post.createdAt || (post as any).date || "";
  const dateStr = dateVal ? new Date(dateVal).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }) : "";

  const plainText = stripHtml(contentStr);
  const readingTime = (post as any).readTime || Math.max(1, Math.ceil(plainText.trim().split(/\s+/).filter(Boolean).length / 220));

  const categoryObj = categories.find((c) => c.id === post.blogCategoryId);
  const categoryName = categoryObj ? (categoryObj.name?.[lang as any] || categoryObj.name?.ar || "") : "";

  const authorName = (post as any).author?.name?.[lang] || (post as any).author?.name || (lang === "ar" ? "الكاتب" : "Author");
  const authorAvatar = (post as any).author?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";

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
          
          <div className={styles.authorBar}>
            <img src={authorAvatar} alt={authorName} className={styles.avatar} />
            <div className={styles.authorMeta}>
              <strong>{authorName}</strong>
              <span>{t.author}</span>
            </div>
          </div>
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
                  const rawRTitle = typeof rPost.title === "string" ? rPost.title : rPost.title?.[lang as any] || rPost.title?.ar || "";
                  const rTitle = stripHtml(rawRTitle);
                  const rImg = rPost.imageUrl || (rPost as any).image || "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800";
                  const rTime = (rPost as any).readTime || 5;

                  return (
                    <Link href={`/blog/${rPost.slug}`} key={rPost.id} className={styles.relatedItem}>
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
