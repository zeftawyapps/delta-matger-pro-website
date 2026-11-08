"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";
import clientConfig from "@/config/clientConfig.json";
import SectionHeader from "@/components/common/SectionHeader";
import { SectionConfig } from "@/types";
import styles from "./StoreComponents.module.css";

interface ContactConfig extends SectionConfig {
  phone?: string;
  email?: string;
  address?: string;
  mapUrl?: string;
  showForm?: boolean;
  formType?: string;
}

interface ContactUsProps {
  config?: ContactConfig;
  title?: string;
  description?: string;
}

export default function ContactUs({ config, title, description }: ContactUsProps) {
  const { lang, config: orgConfig, authToken } = useApp();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const phone = config?.phone || "";
  const email = config?.email || "";
  const address = config?.address || "";
  const mapUrl = config?.mapUrl || "";
  const showForm = config?.showForm !== false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const orgId = orgConfig?.id || clientConfig.defaultOrgName || "default";
      await api.submitFeedback(
        orgId,
        {
          name: formData.name.trim(),
          contact: formData.email.trim(),
          type: config?.formType || "inquiry",
          message: formData.message.trim(),
        },
        authToken || undefined
      );
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (err: any) {
      console.error("Failed to submit contact message to feedback", err);
      setErrorMsg(
        lang === "ar"
          ? "حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى لاحقاً."
          : "Failed to send message. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`${styles.landingSection} animateFadeUp`}>
      <SectionHeader title={title} description={description} config={config} />

      <div className={styles.contactGrid}>
        <div className={`${styles.contactInfo} glassCard`}>
          <h3>{lang === "ar" ? "معلومات التواصل" : "Contact Info"}</h3>
          {phone && (
            <div className={styles.contactItem}>
              <span>📞</span>
              <a href={`tel:${phone}`}>{phone}</a>
            </div>
          )}
          {email && (
            <div className={styles.contactItem}>
              <span>✉️</span>
              <a href={`mailto:${email}`}>{email}</a>
            </div>
          )}
          {address && (
            <div className={styles.contactItem}>
              <span>📍</span>
              <p>{address}</p>
            </div>
          )}
          {mapUrl && (
            <div className={styles.contactMap}>
              <iframe
                src={mapUrl}
                title={lang === "ar" ? "خريطة الموقع" : "Location map"}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </div>

        {showForm && (
          <form className={`${styles.contactForm} glassCard`} onSubmit={handleSubmit}>
            <h3>{lang === "ar" ? "أرسل رسالة" : "Send a Message"}</h3>
            {submitted ? (
              <p className={styles.contactSuccess}>
                {lang === "ar"
                  ? "تم إرسال رسالتك بنجاح! سنتواصل معك قريباً."
                  : "Your message was sent! We'll get back to you soon."}
              </p>
            ) : (
              <>
                <input
                  type="text"
                  placeholder={lang === "ar" ? "الاسم" : "Name"}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={loading}
                  className={styles.contactInput}
                />
                <input
                  type="email"
                  placeholder={lang === "ar" ? "البريد الإلكتروني" : "Email"}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                  className={styles.contactInput}
                />
                <textarea
                  placeholder={lang === "ar" ? "رسالتك" : "Your message"}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  disabled={loading}
                  rows={5}
                  className={styles.contactTextarea}
                />
                {errorMsg && (
                  <p className="inlineErrorBanner" style={{ margin: "0.25rem 0" }}>
                    ⚠️ {errorMsg}
                  </p>
                )}
                <button type="submit" disabled={loading} className="glowButton">
                  {loading
                    ? lang === "ar"
                      ? "جاري الإرسال..."
                      : "Sending..."
                    : lang === "ar"
                    ? "إرسال"
                    : "Send"}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
