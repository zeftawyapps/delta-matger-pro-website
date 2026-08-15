"use client";

import React, { use } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import clientConfig from "@/config/clientConfig.json";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import styles from "./StaticPage.module.css";

interface StaticPageProps {
  params: Promise<{ slug: string }>;
}

export default function StaticPage({ params }: StaticPageProps) {
  const { slug } = use(params);
  const { lang, posts } = useApp();
  const isAr = lang === "ar";

  // Find the page in posts where postType is 'page' and slug matches
  let page = posts.find((p) => p.postType === "page" && p.slug === slug);

  // Check clientConfig.policies as fallback
  let fallbackHtml = "";
  let fallbackTitle = "";

  const policies = (clientConfig as any)?.policies || {};
  const decodedSlug = decodeURIComponent(slug).toLowerCase();

  if (!page) {
    if (["privacy", "privacy-policy", "privacy-policy.html", "سياسة-الخصوصية"].includes(decodedSlug) && policies.privacyHtml) {
      fallbackHtml = policies.privacyHtml;
      fallbackTitle = isAr ? "سياسة الخصوصية" : "Privacy Policy";
    } else if (["return", "return-policy", "refund", "returns", "سياسة-الاسترجاع", "سياسة-الاستبدال-والاسترجاع"].includes(decodedSlug) && policies.returnHtml) {
      fallbackHtml = policies.returnHtml;
      fallbackTitle = isAr ? "سياسة الاسترجاع والاستبدال" : "Return & Refund Policy";
    } else if (["terms", "terms-and-conditions", "الشروط-والاحكام", "الشروط-والأحكام"].includes(decodedSlug) && policies.termsHtml) {
      fallbackHtml = policies.termsHtml;
      fallbackTitle = isAr ? "الشروط والأحكام" : "Terms & Conditions";
    }
  }

  if (!page && !fallbackHtml) {
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

  const titleStr = page
    ? (typeof page.title === "string" ? page.title : page.title?.[lang] || page.title?.ar || "")
    : fallbackTitle;

  const contentStr = page
    ? (typeof page.content === "string" ? page.content : page.content?.[lang] || page.content?.ar || "")
    : fallbackHtml;

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
