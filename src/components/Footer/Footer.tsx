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
  const address = footerConfig?.address || clientFooter?.address || (lang === "ar" ? "القاهرة، جمهورية مصر العربية" : "Cairo, Egypt");
  const phone = footerConfig?.phone || clientFooter?.phone || "+20 100 000 0000";
  const email = footerConfig?.email || clientFooter?.email || "support@domancy.com";

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
