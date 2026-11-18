"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";
import clientConfig from "@/config/clientConfig.json";
import styles from "./ProductReviews.module.css";

interface ProductReviewItem {
  id?: string;
  userName?: string;
  rating?: number;
  subject?: string;
  comment?: string;
  adminReply?: string;
  createdAt?: string;
}

interface ProductReviewsProps {
  productId: string;
}

function renderStarsText(rating: number): string {
  const clamped = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(clamped) + "☆".repeat(5 - clamped);
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { lang, config, authToken, currentUser } = useApp();
  const isAr = lang === "ar";

  const [reviews, setReviews] = useState<ProductReviewItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [subject, setSubject] = useState("");
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let active = true;
    setLoadingList(true);
    api
      .getProductFeedback(productId)
      .then((list) => {
        if (active) setReviews(Array.isArray(list) ? list : []);
      })
      .finally(() => {
        if (active) setLoadingList(false);
      });

    return () => {
      active = false;
    };
  }, [productId]);

  useEffect(() => {
    if (currentUser) {
      if (!name) setName(currentUser.name || currentUser.username || "");
      if (!contact) setContact(currentUser.phone || currentUser.email || "");
    }
  }, [currentUser]);

  const { averageRating, totalCount } = useMemo(() => {
    const rated = reviews.filter(
      (r) => typeof r.rating === "number" && r.rating >= 1 && r.rating <= 5
    );
    const total = reviews.length;
    if (rated.length === 0) {
      return { averageRating: 0, totalCount: total };
    }
    const sum = rated.reduce((acc, r) => acc + (r.rating || 0), 0);
    return {
      averageRating: Math.round((sum / rated.length) * 10) / 10,
      totalCount: total,
    };
  }, [reviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const orgId = config?.id || clientConfig?.defaultOrgName || "default";
      await api.submitFeedback(
        orgId,
        {
          name: name.trim(),
          contact: contact.trim(),
          subject: subject.trim() || undefined,
          type: "product_review",
          message: comment.trim(),
          targetId: productId,
          rating,
        },
        authToken || undefined
      );

      setSuccessMsg(
        isAr
          ? "تم إرسال تقييمك بنجاح! سيظهر بعد المراجعة والاعتماد."
          : "Your review has been submitted! It will appear once approved."
      );
      setSubject("");
      setComment("");
      setRating(5);
      setShowForm(false);
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          (isAr ? "حدث خطأ أثناء إرسال التقييم" : "Failed to submit review")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const activeStars = hoverRating || rating;

  return (
    <div className={`${styles.reviewsContainer} animateFadeUp`}>
      <div className={styles.summaryHeader}>
        <div className={styles.ratingOverview}>
          <span className={styles.avgScore}>
            {totalCount > 0 ? averageRating.toFixed(1) : "—"}
          </span>
          <div className={styles.avgMeta}>
            <span className={styles.starsStatic} aria-label={`${averageRating} out of 5`}>
              {renderStarsText(averageRating)}
            </span>
            <span className={styles.reviewCount}>
              {isAr
                ? `${totalCount} تقييم معتمد`
                : `${totalCount} ${totalCount === 1 ? "review" : "reviews"}`}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm((prev) => !prev);
            setSuccessMsg("");
            setErrorMsg("");
          }}
          className={`glowButton ${styles.toggleFormBtn}`}
        >
          {showForm
            ? isAr
              ? "إلغاء"
              : "Cancel"
            : isAr
            ? "⭐ أضف تقييمك"
            : "⭐ Write a Review"}
        </button>
      </div>

      {successMsg && <div className={styles.successBanner}>✓ {successMsg}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.reviewForm}>
          <h4 className={styles.formTitle}>
            {isAr ? "تقييم المنتج" : "Rate this product"}
          </h4>

          <div className={styles.starPickerRow}>
            <span className={styles.starPickerLabel}>
              {isAr ? "التقييم بالنجوم:" : "Your rating:"}
            </span>
            <div
              className={styles.starsInteractive}
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  className={`${styles.starBtn} ${
                    star <= activeStars ? styles.starActive : ""
                  }`}
                  aria-label={isAr ? `${star} نجوم` : `${star} stars`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>{isAr ? "الاسم" : "Your Name"}</label>
              <input
                type="text"
                required={!currentUser}
                placeholder={isAr ? "أدخل اسمك" : "Enter your name"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="customInput"
              />
            </div>

            <div className={styles.formGroup}>
              <label>
                {isAr ? "رقم الهاتف أو البريد (اختياري)" : "Phone or Email (optional)"}
              </label>
              <input
                type="text"
                placeholder={isAr ? "010xxxxxx أو mail@domain.com" : "010xxxxxx or mail@domain.com"}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="customInput"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>{isAr ? "عنوان التقييم (اختياري)" : "Review Title (optional)"}</label>
            <input
              type="text"
              maxLength={200}
              placeholder={isAr ? "ملخص تجربتك مع المنتج" : "Summarize your experience"}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="customInput"
            />
          </div>

          <div className={styles.formGroup}>
            <label>{isAr ? "تفاصيل التقييم" : "Your Review"}</label>
            <textarea
              required
              rows={4}
              maxLength={2000}
              placeholder={isAr ? "شاركنا رأيك في المنتج..." : "Share your thoughts about this product..."}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="customInput"
              style={{ resize: "vertical" }}
            />
          </div>

          {errorMsg && <div className={styles.errorBanner}>⚠️ {errorMsg}</div>}

          <button
            type="submit"
            disabled={submitting}
            className={`glowButton ${styles.submitBtn}`}
          >
            {submitting
              ? isAr
                ? "جاري الإرسال..."
                : "Submitting..."
              : isAr
              ? "إرسال التقييم"
              : "Submit Review"}
          </button>
        </form>
      )}

      {loadingList ? (
        <div className={styles.emptyState}>
          {isAr ? "جاري تحميل التقييمات..." : "Loading reviews..."}
        </div>
      ) : reviews.length === 0 ? (
        <div className={styles.emptyState}>
          {isAr
            ? "لا توجد تقييمات معتمدة لهذا المنتج حتى الآن. كن أول من يقيّمه!"
            : "No approved reviews for this product yet. Be the first to review it!"}
        </div>
      ) : (
        <div className={styles.reviewsList}>
          {reviews.map((rev, idx) => (
            <div key={rev.id || idx} className={styles.reviewCard}>
              <div className={styles.reviewCardHeader}>
                <div>
                  <span className={styles.reviewerName}>
                    {rev.userName || (isAr ? "عميل" : "Customer")}
                  </span>
                  {typeof rev.rating === "number" && (
                    <span className={styles.starsStatic} style={{ marginInlineStart: "0.75rem", fontSize: "0.95rem" }}>
                      {renderStarsText(rev.rating)}
                    </span>
                  )}
                </div>
                {rev.createdAt && (
                  <span className={styles.reviewDate}>
                    {new Date(rev.createdAt).toLocaleDateString(
                      isAr ? "ar-EG" : "en-US"
                    )}
                  </span>
                )}
              </div>

              {rev.subject && <p className={styles.reviewSubject}>{rev.subject}</p>}
              {rev.comment && <p className={styles.reviewComment}>{rev.comment}</p>}

              {rev.adminReply && (
                <div className={styles.adminReplyBox}>
                  <div className={styles.adminReplyLabel}>
                    {isAr ? "رد الإدارة:" : "Store Reply:"}
                  </div>
                  <div>{rev.adminReply}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
