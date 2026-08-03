"use client";

import React, { use } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import styles from "./StaticPage.module.css";

interface StaticPageProps {
  params: Promise<{ slug: string }>;
}

export default function StaticPage({ params }: StaticPageProps) {
  const { slug } = use(params);
  const { lang, posts } = useApp();

  // Find the page in posts where postType is 'page' and slug matches
  const page = posts.find((p) => p.postType === "page" && p.slug === slug);

  if (!page) {
    return (
      <div className={styles.wrapper}>
        <Navbar />
        <main className={styles.notFound}>
          <h2>Page Not Found / الصفحة غير موجودة</h2>
          <Link href="/" className="glowButton">
            Back to Home / العودة للرئيسية
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isAr = lang === "ar";
  const titleStr = typeof page.title === "string" ? page.title : page.title?.[lang] || page.title?.ar || "";
  const contentStr = typeof page.content === "string" ? page.content : page.content?.[lang] || page.content?.ar || "";

  // Check if content looks like HTML
  const isHtml = /<[a-z][\s\S]*>/i.test(contentStr);

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={`${styles.main} ${isAr ? styles.rtl : styles.ltr}`}>
        <div className={`${styles.card} glassCard`}>
          <h1>{titleStr}</h1>

          {isHtml ? (
            <div
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: contentStr }}
            />
          ) : (
            <div className={styles.content}>
              {contentStr.split("\n\n").map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
