"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";
import clientConfig from "@/config/clientConfig.json";
import { resolveLocalizedText } from "@/utils/sectionHelpers";
import FeedbackModal from "../FeedbackModal/FeedbackModal";
import styles from "./Footer.module.css";

export default function Footer() {
  const { lang, t, appMode, categories, productCategories, config, footerPages, appTitle, authToken } = useApp();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  const footerAdvanced = config?.website?.footerAdvanced;
  const licenseInfo = footerAdvanced?.licenseInfo;
  const paymentIcons = footerAdvanced?.paymentIcons;

  const handleFooterNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterLoading(true);
    try {
      await api.subscribeNewsletter({
        organizationId: config?.id || clientConfig.defaultOrgName || "default",
        email: newsletterEmail.trim(),
        source: "footer_newsletter",
        lang,
        token: authToken || undefined,
      });
      setNewsletterSuccess(true);
      setNewsletterEmail("");
    } catch (err) {
      console.error("Newsletter error", err);
    } finally {
      setNewsletterLoading(false);
    }
  };

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

  // Footer Logo & Branding Config (resolves website.footer > config.footer > clientConfig.footer)
  const footerConfig = config?.website?.footer || config?.footer || clientFooter || {};

  // 1. هل يتم إظهار الشعار؟
  const showLogo = footerConfig.showLogo ?? true;

  // 2. تحديد مصدر الصورة (شعار مخصص للفوتر أم الشعار العام)
  const effectiveLogoUrl =
    (footerConfig.logoUrl && footerConfig.logoUrl.trim().length > 0)
      ? footerConfig.logoUrl
      : (config?.website?.footerLogoUrl || config?.visual?.logoUrl || (clientConfig as any)?.logoUrl || '');

  // 3. ارتفاع الشعار (إذا حُدد رقم مخصص، وإلا يعتمد على CSS الافتراضي)
  const logoHeight = Number(footerConfig.logoHeight) || 0;

  // 4. هل يتم إظهار اسم المتجر بجوار الشعار؟
  const showTitle = footerConfig.showTitle ?? true;

  // 5. ستايل الشعار (Solid أم Gradient)
  const logoStyle = footerConfig.logoStyle || 'solid';

  const footerDesc = footerConfig?.description || clientFooter?.description || (clientConfig as any)?.appDescription || t.slogan;
  const address = footerConfig?.address?.trim() || clientFooter?.address?.trim() || "";
  const phone = footerConfig?.phone?.trim() || clientFooter?.phone?.trim() || "";
  const email = footerConfig?.email?.trim() || clientFooter?.email?.trim() || "";

  const socialConfig =
    config?.website?.socialMedia ||
    config?.socialMedia ||
    (config?.website?.footer as any)?.socialMedia ||
    (config?.footer as any)?.socialMedia ||
    clientSocial ||
    {};

  const facebookUrl = socialConfig?.facebook?.trim() || "";
  const instagramUrl = socialConfig?.instagram?.trim() || "";
  const rawTelegram = socialConfig?.telegram?.trim() || "";
  const rawWhatsapp = socialConfig?.whatsapp?.trim() || "";
  const twitterUrl = (socialConfig?.twitter || socialConfig?.x)?.trim() || "";
  const youtubeUrl = socialConfig?.youtube?.trim() || "";
  const tiktokUrl = socialConfig?.tiktok?.trim() || "";
  const linkedinUrl = socialConfig?.linkedin?.trim() || "";
  const snapchatUrl = socialConfig?.snapchat?.trim() || "";

  let whatsappUrl = "";
  if (rawWhatsapp) {
    if (rawWhatsapp.startsWith("http://") || rawWhatsapp.startsWith("https://") || rawWhatsapp.startsWith("//")) {
      whatsappUrl = rawWhatsapp;
    } else if (rawWhatsapp.includes("wa.me") || rawWhatsapp.includes("whatsapp.com")) {
      whatsappUrl = `https://${rawWhatsapp.replace(/^https?:\/\//, "")}`;
    } else {
      const cleanPhone = rawWhatsapp.replace(/\D/g, "");
      if (cleanPhone) {
        whatsappUrl = `https://wa.me/${cleanPhone}`;
      }
    }
  }

  let telegramUrl = "";
  if (rawTelegram) {
    if (rawTelegram.startsWith("http://") || rawTelegram.startsWith("https://") || rawTelegram.startsWith("//")) {
      telegramUrl = rawTelegram;
    } else {
      telegramUrl = `https://t.me/${rawTelegram.replace(/^@/, "")}`;
    }
  }

  const hasSocials =
    facebookUrl ||
    instagramUrl ||
    telegramUrl ||
    whatsappUrl ||
    twitterUrl ||
    youtubeUrl ||
    tiktokUrl ||
    linkedinUrl ||
    snapchatUrl;

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
          {(showLogo || showTitle) && (
            <Link href="/" className={styles.logo}>
              {showLogo && effectiveLogoUrl ? (
                <img
                  src={effectiveLogoUrl}
                  alt={appTitle}
                  style={logoHeight > 0 ? { height: `${logoHeight}px`, width: 'auto', objectFit: 'contain' } : undefined}
                  className={`${styles.logoImage} ${logoStyle === 'gradient' ? styles.logoGradient : ''}`}
                />
              ) : showLogo ? (
                <span className={styles.logoIcon}>◆</span>
              ) : null}

              {showTitle && (
                <span className={`${styles.logoText} ${logoStyle === 'gradient' ? styles.logoTitleGradient : ''}`}>
                  {appTitle}
                </span>
              )}
            </Link>
          )}
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
          {(address || email || phone) && (
            <div className={styles.contactDetails}>
              {address && <p>📍 {address}</p>}
              {email && (
                <p>
                  ✉ <a href={`mailto:${email}`} style={{ color: "inherit", textDecoration: "none" }}>{email}</a>
                </p>
              )}
              {phone && (
                <p>
                  📞 <a href={`tel:${phone}`} style={{ color: "inherit", textDecoration: "none" }}>{phone}</a>
                </p>
              )}
            </div>
          )}

          {hasSocials && (
            <div className={styles.socials}>
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} title="Facebook" aria-label="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} title="Instagram" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {telegramUrl && (
                <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} title="Telegram" aria-label="Telegram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.196 1.006.128.832.941z"/>
                  </svg>
                </a>
              )}
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} title="WhatsApp" aria-label="WhatsApp">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </a>
              )}
              {twitterUrl && (
                <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} title="X (Twitter)" aria-label="X">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
              {youtubeUrl && (
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} title="YouTube" aria-label="YouTube">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
              {tiktokUrl && (
                <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} title="TikTok" aria-label="TikTok">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
              )}
              {linkedinUrl && (
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} title="LinkedIn" aria-label="LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              )}
              {snapchatUrl && (
                <a href={snapchatUrl} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} title="Snapchat" aria-label="Snapchat">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.002.5c-3.86 0-6.945 3.04-6.945 7.158 0 .86.23 2.148.514 2.887.165.428.113.636-.264.912-.76.554-1.897 1.082-2.582 2.148-.48.746-.226 1.488.594 1.777 1.15.405 2.26.24 3.328.051.52-.093.856.128.874.577.054 1.34-1.077 2.016-1.929 2.559-.693.442-.879 1.055-.453 1.636.565.772 1.956.88 3.197.433 1.01-.364 1.68-.026 2.046.54.494.767 1.084.774 1.62.002.366-.527.994-.88 2.023-.526 1.25.43 2.645.318 3.208-.45.424-.58.236-1.192-.457-1.634-.852-.544-1.984-1.22-1.929-2.56.018-.448.354-.67.874-.577 1.068.189 2.179.354 3.328-.052.82-.288 1.074-1.03.594-1.776-.685-1.066-1.822-1.594-2.582-2.148-.377-.276-.429-.484-.264-.912.284-.739.514-2.027.514-2.887C18.947 3.54 15.862.5 12.002.5z"/>
                  </svg>
                </a>
              )}
            </div>
          )}

          {footerAdvanced?.showNewsletter && (
            <div style={{ marginTop: "1.25rem", width: "100%" }}>
              {footerAdvanced.newsletterTitle && (
                <h4 style={{ marginBottom: "0.4rem", fontSize: "0.95rem" }}>
                  {resolveLocalizedText(footerAdvanced.newsletterTitle, lang)}
                </h4>
              )}
              {newsletterSuccess ? (
                <p style={{ fontSize: "0.85rem", color: "var(--accent)" }}>
                  🎉 {t.successNewsletter}
                </p>
              ) : (
                <form
                  onSubmit={handleFooterNewsletter}
                  style={{ display: "flex", gap: "0.5rem" }}
                >
                  <input
                    type="email"
                    required
                    disabled={newsletterLoading}
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="customInput"
                    style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}
                  />
                  <button
                    type="submit"
                    disabled={newsletterLoading}
                    className="glowButton"
                    style={{ padding: "0.5rem 0.9rem", fontSize: "0.85rem" }}
                  >
                    {t.subscribe}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* License & Payment Badges Bar */}
      {(licenseInfo || (paymentIcons && paymentIcons.length > 0)) && (
        <div
          style={{
            maxWidth: "1200px",
            margin: "1.5rem auto 0",
            padding: "1rem 1.5rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            fontSize: "0.85rem",
            opacity: 0.85,
          }}
        >
          {licenseInfo && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem" }}>
              {licenseInfo.commercialRegNumber && (
                <span>
                  📜 {lang === "ar" ? "السجل التجاري:" : "CR:"}{" "}
                  <strong>{licenseInfo.commercialRegNumber}</strong>
                </span>
              )}
              {licenseInfo.industrialLicenseNumber && (
                <span>
                  🏭 {lang === "ar" ? "الترخيص الصناعي:" : "Industrial License:"}{" "}
                  <strong>{licenseInfo.industrialLicenseNumber}</strong>
                </span>
              )}
              {licenseInfo.taxNumber && (
                <span>
                  🧾 {lang === "ar" ? "الرقم الضريبي:" : "Tax ID:"}{" "}
                  <strong>{licenseInfo.taxNumber}</strong>
                </span>
              )}
              {licenseInfo.trademarkName && (
                <span>
                  ®️ {lang === "ar" ? "العلامة المسجلة:" : "Trademark:"}{" "}
                  <strong>{licenseInfo.trademarkName}</strong>
                </span>
              )}
            </div>
          )}

          {paymentIcons && paymentIcons.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {paymentIcons.map((pm, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: "0.25rem 0.65rem",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  💳 {pm.replace("_", " ")}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

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
