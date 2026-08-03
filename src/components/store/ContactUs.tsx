"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import styles from "./StoreComponents.module.css";

interface ContactConfig {
  phone?: string;
  email?: string;
  address?: string;
  mapUrl?: string;
  showForm?: boolean;
}

interface ContactUsProps {
  config?: ContactConfig;
  title?: string;
  description?: string;
}

export default function ContactUs({ config, title, description }: ContactUsProps) {
  const { lang } = useApp();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const phone = config?.phone || "";
  const email = config?.email || "";
  const address = config?.address || "";
  const mapUrl = config?.mapUrl || "";
  const showForm = config?.showForm !== false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className={`${styles.landingSection} animateFadeUp`}>
      {(title || description) && (
        <div className={styles.landingSectionHeader}>
          {title && <h2 className={styles.sectionTitle}>{title}</h2>}
          {description && <p className={styles.sectionSubtitle}>{description}</p>}
        </div>
      )}

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
                  className={styles.contactInput}
                />
                <input
                  type="email"
                  placeholder={lang === "ar" ? "البريد الإلكتروني" : "Email"}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className={styles.contactInput}
                />
                <textarea
                  placeholder={lang === "ar" ? "رسالتك" : "Your message"}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={5}
                  className={styles.contactTextarea}
                />
                <button type="submit" className="glowButton">
                  {lang === "ar" ? "إرسال" : "Send"}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
