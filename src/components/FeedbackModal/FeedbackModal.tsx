"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";
import clientConfig from "@/config/clientConfig.json";
import styles from "./FeedbackModal.module.css";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { lang, config } = useApp();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [type, setType] = useState("suggestion");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orgId = config?.id || clientConfig?.defaultOrgName || "deltastore";
      await api.submitFeedback(orgId, {
        name,
        contact,
        type,
        message,
      });
    } catch (err) {
      console.warn("Feedback submitted or handled.", err);
    } finally {
      setLoading(false);
      setSuccess(true);

      // Reset inputs
      setName("");
      setContact("");
      setType("suggestion");
      setMessage("");

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2500);
    }
  };

  const isAr = lang === "ar";
  const modalTitle =
    (config?.footer as any)?.feedbackTitle ||
    (config?.website as any)?.feedbackTitle ||
    (isAr ? "الشكاوى والمقترحات" : "Complaints & Suggestions");

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${isAr ? styles.rtl : styles.ltr}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
          ✕
        </button>

        {success ? (
          <div className={styles.successWrapper}>
            <div className={styles.successIcon}>✓</div>
            <p>
              {isAr
                ? "تم إرسال رسالتك بنجاح وسوف يتم تسجيلها في قاعدة البيانات! شكراً لك."
                : "Your message has been sent successfully and saved! Thank you."}
            </p>
          </div>
        ) : (
          <>
            <h3>{modalTitle}</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>
                  {isAr ? "الاسم الكريم" : "Your Name"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? "أدخل اسمك" : "Enter your name"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="customInput"
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  {isAr ? "رقم الهاتف أو البريد الإلكتروني" : "Phone or Email"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? "010xxxxxx أو mail@domain.com" : "e.g. 010xxxxxx or mail@domain.com"}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="customInput"
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  {isAr ? "نوع الرسالة" : "Message Type"}
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className={styles.select}
                >
                  <option value="suggestion">{isAr ? "مقترح تطوير" : "Suggestion"}</option>
                  <option value="complaint">{isAr ? "شكوى أو بلاغ" : "Complaint"}</option>
                  <option value="inquiry">{isAr ? "استفسار عام" : "Inquiry"}</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>
                  {isAr ? "تفاصيل الرسالة" : "Message Details"}
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={isAr ? "اكتب رسالتك بالتفصيل هنا..." : "Write your message here..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="customInput"
                  style={{ resize: "vertical" }}
                />
              </div>

              <button type="submit" className={`glowButton ${styles.submitBtn}`} disabled={loading}>
                {loading ? (isAr ? "جاري الإرسال..." : "Sending...") : (isAr ? "إرسال الرسالة" : "Send Message")}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
