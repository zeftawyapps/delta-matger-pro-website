"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import clientConfig from "@/config/clientConfig.json";
import FeedbackModal from "../FeedbackModal/FeedbackModal";
import styles from "./Footer.module.css";

export default function Footer() {
  const { lang, t, appMode, categories, productCategories, config, footerPages, appTitle } = useApp();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const appVersion = config?.appVersion || clientConfig?.appVersion || "1.0.0";
  const appBuildIndex = config?.appBuildIndex || clientConfig?.appBuildIndex || 1;

  // Dynamic categories list based on appMode and database-loaded entries
  const getDynamicCategories = () => {
    if (appMode === "store") {
      return productCategories.slice(0, 4).map((c) => {
        const nameStr = typeof c.name === "string" ? c.name : c.name?.[lang] || c.name?.ar || "";
        return {
          name: nameStr,
          href: `/store?category=${c.id}`,
        };
      });
    } else if (appMode === "blog") {
      return categories.slice(0, 4).map((c) => {
        const nameStr = typeof c.name === "string" ? c.name : c.name?.[lang] || c.name?.ar || "";
        return {
          name: nameStr,
          href: `/blog?category=${c.id}`,
        };
      });
    } else {
      // Mixed categories for Hybrid
      const mixed = [];
      if (productCategories.length > 0) {
        const c = productCategories[0];
        mixed.push({
          name: typeof c.name === "string" ? c.name : c.name?.[lang] || c.name?.ar || "",
          href: `/store?category=${c.id}`,
        });
      }
      if (categories.length > 0) {
        const c = categories[0];
        mixed.push({
          name: typeof c.name === "string" ? c.name : c.name?.[lang] || c.name?.ar || "",
          href: `/blog?category=${c.id}`,
        });
      }
      if (productCategories.length > 1) {
        const c = productCategories[1];
        mixed.push({
          name: typeof c.name === "string" ? c.name : c.name?.[lang] || c.name?.ar || "",
          href: `/store?category=${c.id}`,
        });
      }
      if (categories.length > 1) {
        const c = categories[1];
        mixed.push({
          name: typeof c.name === "string" ? c.name : c.name?.[lang] || c.name?.ar || "",
          href: `/blog?category=${c.id}`,
        });
      }
      return mixed;
    }
  };

  const dynamicCategories = getDynamicCategories();

  // Branding configuration fallbacks
  const clientFooter = (clientConfig as any)?.footer;
  const clientSocial = (clientConfig as any)?.socialMedia;

  const footerDesc = config?.footer?.description || clientFooter?.description || (clientConfig as any)?.appDescription || t.slogan;
  const address = config?.footer?.address || clientFooter?.address || (lang === "ar" ? "القاهرة، جمهورية مصر العربية" : "Cairo, Egypt");
  const phone = config?.footer?.phone || clientFooter?.phone || "+20 100 000 0000";
  const email = config?.footer?.email || clientFooter?.email || "support@domancy.com";

  const facebookUrl = config?.socialMedia?.facebook || clientSocial?.facebook || "";
  const telegramUrl = config?.socialMedia?.telegram || clientSocial?.telegram || "";
  const whatsappNumber = config?.socialMedia?.whatsapp || clientSocial?.whatsapp || "";
  const instagramUrl = config?.socialMedia?.instagram || clientSocial?.instagram || "";

  const footerLayout = config?.website?.footerLayout ?? 'classic';
  const footerTheme = config?.website?.footerTheme ?? 'solid';

  const feedbackTitle =
    (config?.footer as any)?.feedbackTitle ||
    (config?.website as any)?.feedbackTitle ||
    (lang === "ar" ? "الشكاوى والمقترحات" : "Complaints & Suggestions");

  return (
    <footer className={`${styles.footer} ${styles[`layout_${footerLayout}`]} ${styles[`theme_${footerTheme}`]} ${lang === "ar" ? styles.rtl : styles.ltr}`}>
      <div className={styles.container}>
        {/* Column 1: Slogan/Definition */}
        <div className={styles.column}>
          <Link href="/" className={styles.logo}>
            {config?.visual?.logoUrl || (clientConfig as any)?.logoUrl ? (
              <img
                src={config?.visual?.logoUrl || (clientConfig as any)?.logoUrl}
                alt={appTitle}
                className={styles.logoImage}
              />
            ) : (
              <>
                <span className={styles.logoIcon}>◆</span>
                <span className={styles.logoText}>{appTitle}</span>
              </>
            )}
          </Link>
          <p className={styles.sloganText}>{footerDesc}</p>
          <p className={styles.taglineText}>{t.tagline}</p>
        </div>

        {/* Column 2: Quick Links */}
        <div className={styles.column}>
          <h3>{t.quickLinks}</h3>
          <ul className={styles.linkList}>
            <li>
              <Link href="/">{t.home}</Link>
            </li>
            <li>
              <button
                onClick={() => setFeedbackOpen(true)}
                style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", font: "inherit", padding: 0 }}
              >
                {feedbackTitle}
              </button>
            </li>

            {footerPages.map((page) => {
              const title = typeof page.title === "string" ? page.title : page.title?.[lang] || page.title?.ar || "";
              return (
                <li key={page.id}>
                  <Link href={`/${page.slug}`}>{title}</Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Column 3 & 3b: Categories (dynamic & split) */}
        {appMode === "hybrid" ? (
          <>
            {config?.website?.showStoreCategoriesInFooter !== false && productCategories.length > 0 && (
              <div className={styles.column}>
                <h3>{lang === "ar" ? "تصنيفات المتجر" : "Store Categories"}</h3>
                <ul className={styles.linkList}>
                  {productCategories.slice(0, 5).map((c) => {
                    const nameStr = typeof c.name === "string" ? c.name : c.name?.[lang] || c.name?.ar || "";
                    return (
                      <li key={c.id}>
                        <Link href={`/store?category=${c.id}`}>{nameStr}</Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {config?.website?.showBlogCategoriesInFooter !== false && categories.length > 0 && (
              <div className={styles.column}>
                <h3>{lang === "ar" ? "تصنيفات المدونة" : "Blog Categories"}</h3>
                <ul className={styles.linkList}>
                  {categories.slice(0, 5).map((c) => {
                    const nameStr = typeof c.name === "string" ? c.name : c.name?.[lang] || c.name?.ar || "";
                    return (
                      <li key={c.id}>
                        <Link href={`/blog?category=${c.id}`}>{nameStr}</Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        ) : (
          // In non-hybrid mode, show the matching category list if enabled
          ((appMode === "store" && config?.website?.showStoreCategoriesInFooter !== false && productCategories.length > 0) ||
           (appMode === "blog" && config?.website?.showBlogCategoriesInFooter !== false && categories.length > 0)) && (
            <div className={styles.column}>
              <h3>{t.categories}</h3>
              <ul className={styles.linkList}>
                {dynamicCategories.map((cat, index) => (
                  <li key={index}>
                    <Link href={cat.href}>{cat.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        )}

        {/* Column 4: Contact/Social */}
        <div className={styles.column}>
          <h3>{t.contactUs}</h3>
          <div className={styles.contactDetails}>
            {address && <p>📍 {address}</p>}
            {email && <p>✉ {email}</p>}
            {phone && <p>📞 {phone}</p>}
          </div>
          <div className={styles.socials}>
            {facebookUrl && (
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} title="Facebook">
                📘
              </a>
            )}
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} title="Instagram">
                📸
              </a>
            )}
            {telegramUrl && (
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} title="Telegram">
                ✈️
              </a>
            )}
            {whatsappNumber && (
              <a href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} title="WhatsApp">
                💬
              </a>
            )}
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.bottomContainer}>
          <p>
            {config?.footer?.copyright || t.copyright}
            <span style={{ marginInlineStart: "10px", opacity: 0.8, fontSize: "0.9em" }}>
              • v{appVersion} (Build {appBuildIndex})
            </span>
          </p>
        </div>
      </div>
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </footer>
  );
}
