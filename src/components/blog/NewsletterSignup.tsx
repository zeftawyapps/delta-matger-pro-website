"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import styles from "./BlogComponents.module.css";

export default function NewsletterSignup() {
  const { t } = useApp();
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().length > 5) {
      setSuccess(true);
      setEmail("");
    }
  };

  return (
    <section className={`${styles.newsletterSection} animateFadeUp`}>
      <div className={`${styles.newsletterBox} glassCard`}>
        <div className={styles.newsletterContent}>
          <h3>{t.newsletterTitle}</h3>
          <p>{t.newsletterSubtitle}</p>
          
          {success ? (
            <div className={styles.successMessage} role="alert">
              🎉 {t.successNewsletter}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.newsletterForm}>
              <input
                type="email"
                required
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="customInput"
              />
              <button type="submit" className="glowButton">
                {t.subscribe}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
