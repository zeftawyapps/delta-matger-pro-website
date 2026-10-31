"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";
import clientConfig from "@/config/clientConfig.json";
import { getSectionHeaderTexts } from "@/utils/sectionHelpers";
import styles from "./BlogComponents.module.css";

interface NewsletterSignupProps {
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  source?: string;
}

export default function NewsletterSignup({
  title,
  description,
  source = "newsletter_section",
}: NewsletterSignupProps = {}) {
  const { t, lang, config, authToken } = useApp();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { titleText, descText, hasHeader } = getSectionHeaderTexts(
    { title, description },
    lang
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg(
        lang === "ar"
          ? "يرجى إدخال بريد إلكتروني صحيح."
          : "Please enter a valid email address."
      );
      return;
    }

    setLoading(true);
    try {
      const orgId = config?.id || clientConfig.defaultOrgName || "default";
      await api.subscribeNewsletter({
        organizationId: orgId,
        email: trimmedEmail,
        source,
        lang,
        token: authToken || undefined,
      });
      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.toLowerCase().includes("already") || msg.includes("مسجل")) {
        setErrorMsg(
          lang === "ar"
            ? "هذا البريد مسجل لدينا بالفعل!"
            : "This email is already subscribed!"
        );
      } else {
        setErrorMsg(
          lang === "ar"
            ? "حدث خطأ في الاتصال، يرجى المحاولة لاحقاً."
            : "Connection error, please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`${styles.newsletterSection} animateFadeUp`}>
      <div className={`${styles.newsletterBox} glassCard attractiveCard`}>
        <div className={styles.newsletterContent}>
          {hasHeader && (
            <>
              {titleText && <h3>{titleText}</h3>}
              {descText && <p>{descText}</p>}
            </>
          )}

          {success ? (
            <div className={styles.successMessage} role="alert">
              🎉{" "}
              {lang === "ar"
                ? "شكراً لاشتراكك! تم تسجيل بريدك بنجاح في قائمتنا البريدية."
                : t.successNewsletter}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.newsletterForm}>
              <input
                type="email"
                required
                disabled={loading}
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="customInput"
              />
              <button type="submit" disabled={loading} className="glowButton">
                {loading
                  ? lang === "ar"
                    ? "جاري الاشتراك..."
                    : "Subscribing..."
                  : t.subscribe}
              </button>
            </form>
          )}
          {errorMsg && (
            <p className="inlineErrorBanner" style={{ marginTop: "0.75rem" }}>
              ⚠️ {errorMsg}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
