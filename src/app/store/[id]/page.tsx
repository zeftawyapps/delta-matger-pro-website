"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { formatPrice } from "@/utils/currency";
import styles from "./ProductPage.module.css";

export default function ProductContent() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { addToCart, lang, t, products, productCategories, organizationPolicy } = useApp();

  // Find the active product from context list
  const product = products.find((p) => String(p.id) === String(id));

  // State controls
  const [activeImg, setActiveImg] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("desc");
  const [added, setAdded] = useState(false);

  // Dynamic reviews list
  const [reviewsList, setReviewsList] = useState([
    {
      name: lang === "ar" ? "محمد صالح" : "Mohamed Saleh",
      stars: 5,
      text: lang === "ar"
        ? "منتج ممتاز وتوصيل سريع للغاية! الجودة مذهلة وتستحق التجربة."
        : "Excellent product and super fast shipping! The quality is amazing.",
      date: "2026-06-18"
    },
    {
      name: lang === "ar" ? "سارة مراد" : "Sarah Mourad",
      stars: 4,
      text: lang === "ar"
        ? "جميل جداً ويعمل بشكل ممتاز، العيب الوحيد أن الشحن استغرق 4 أيام بدلاً من يومين."
        : "Very beautiful and works perfectly. The only downside is shipping took 4 days.",
      date: "2026-06-15"
    }
  ]);
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewName.trim() && reviewText.trim()) {
      const newReview = {
        name: reviewName,
        stars: reviewStars,
        text: reviewText,
        date: new Date().toISOString().split("T")[0]
      };
      setReviewsList([newReview, ...reviewsList]);
      setReviewName("");
      setReviewText("");
      setReviewStars(5);
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    }
  };

  // Sync initial selections on mount or product change
  useEffect(() => {
    if (product) {
      const imgUrl = product.imageUrl || (product as any).image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600";
      setActiveImg(imgUrl);
      
      const colors = (product as any).colors || [];
      setSelectedColor(colors.length > 0 ? colors[0] : "");
      
      const priceOpts = product.priceOptions || [];
      if (priceOpts.length > 0) {
        setSelectedSize(priceOpts[0].sizeDisplay 
          ? (typeof priceOpts[0].sizeDisplay === "string" ? priceOpts[0].sizeDisplay : priceOpts[0].sizeDisplay[lang] || priceOpts[0].sizeDisplay.ar)
          : `${priceOpts[0].quantity} ${priceOpts[0].unit || ""}`
        );
      } else {
        const sizes = (product as any).sizes || [];
        setSelectedSize(sizes.length > 0 ? sizes[0] : "");
      }
      setQty(1);
    }
  }, [product, lang]);

  if (!product) {
    return (
      <div className={styles.wrapper}>
        <Navbar />
        <div className={styles.notFound}>
          <h2>Product not found / المنتج غير موجود</h2>
          <Link href="/store" className="glowButton">
            Back to Shop / العودة للمتجر
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Resilient parsing
  const nameStr = typeof product.name === "string" ? product.name : product.name?.[lang] || product.name?.ar || "";
  const descStr = product.additionalData?.description || (product as any).description?.[lang] || (product as any).description?.ar || "";
  const detailedDesc = product.additionalData?.detailedDescription || descStr;
  
  const mainImgUrl = product.imageUrl || (product as any).image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600";
  
  const gallery = product.imageUrls && product.imageUrls.length > 0
    ? product.imageUrls
    : [mainImgUrl, "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600", "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600"];

  const ratingVal = (product as any).rating || 5;
  const reviewsVal = ((product as any).reviewsCount || 15) + (reviewsList.length - 2);

  const catObj = productCategories.find((c) => c.id === product.categoryId);
  const catLabel = catObj ? (typeof catObj.name === "string" ? catObj.name : catObj.name?.[lang] || catObj.name?.ar || "") : "";

  // Dynamic specifications
  const specsList = (product as any).specs?.[lang] || [
    { name: lang === "ar" ? "الوحدة" : "Unit", value: product.unit || "pcs" },
    { name: lang === "ar" ? "الحالة" : "Condition", value: product.isNew ? (lang === "ar" ? "جديد" : "New") : (lang === "ar" ? "مستعمل نظيف" : "Like New") }
  ];

  // Find current selected option price & oldPrice
  let activePrice = product.price;
  let activeOldPrice = product.oldPrice;

  if (product.priceOptions && product.priceOptions.length > 0) {
    const selectedOpt = product.priceOptions.find((opt) => {
      const label = opt.sizeDisplay 
        ? (typeof opt.sizeDisplay === "string" ? opt.sizeDisplay : opt.sizeDisplay[lang] || opt.sizeDisplay.ar)
        : `${opt.quantity} ${opt.unit || ""}`;
      return label === selectedSize;
    });

    if (selectedOpt) {
      activePrice = selectedOpt.price;
      activeOldPrice = selectedOpt.oldPrice;
    }
  }

  // Calculate discount percentage
  const hasDiscount = activeOldPrice && activeOldPrice > activePrice;
  const discountPercent = hasDiscount 
    ? Math.round(((activeOldPrice - activePrice) / activeOldPrice) * 100) 
    : 0;

  const handleAddToCart = () => {
    // Add customized attributes to additionalData
    const customizedProduct = {
      ...product,
      price: activePrice,
      oldPrice: activeOldPrice,
      additionalData: {
        ...product.additionalData,
        selectedColor,
        selectedSize,
        selectedPriceOptionKey: selectedSize,
      }
    };
    addToCart(customizedProduct, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={`${styles.main} ${lang === "ar" ? styles.rtl : styles.ltr}`}>
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbs}>
          <Link href="/">{t.home}</Link>
          <span>/</span>
          <Link href="/store">{t.store}</Link>
          <span>/</span>
          <span className={styles.activeBreadcrumb}>{nameStr}</span>
        </div>

        {/* Product Hero Layout */}
        <div className={styles.productHero}>
          {/* Photo Gallery Column */}
          <div className={styles.galleryCol}>
            <div className={`${styles.mainImgWrapper} glassCard`}>
              <img src={activeImg || mainImgUrl} alt={nameStr} className={styles.mainImg} />
            </div>
            <div className={styles.thumbnailsRow}>
              {gallery.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImg(img)}
                  className={`${styles.thumbBtn} glassCard ${activeImg === img ? styles.activeThumb : ""}`}
                >
                  <img src={img} alt="Product Thumbnail" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Purchasing Options Column */}
          <div className={styles.optionsCol}>
            {catLabel && <span className={styles.categoryBadge}>{catLabel}</span>}
            <h1>{nameStr}</h1>
            
            {/* Rating Stars */}
            <div className={styles.ratingRow}>
              <span className={styles.stars}>{"★".repeat(Math.floor(ratingVal)) + "☆".repeat(5 - Math.floor(ratingVal))}</span>
              <strong>{ratingVal}</strong>
              <span className={styles.reviewsCount}>({reviewsVal} {t.reviews})</span>
            </div>

            {/* Price */}
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>{t.price}:</span>
              <span className={styles.priceVal}>{formatPrice(activePrice * qty, organizationPolicy?.logistics?.currency, lang)}</span>
              {activeOldPrice && activeOldPrice > activePrice && (
                <span style={{ textDecoration: "line-through", opacity: 0.5, marginInlineStart: "0.5rem" }}>
                  {formatPrice(activeOldPrice * qty, organizationPolicy?.logistics?.currency, lang)}
                </span>
              )}
              {hasDiscount && (
                <span className={styles.discountBadge} style={{
                  background: "var(--color-accent, #ecc951)",
                  color: "var(--color-text-on-primary, #1a2332)",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "var(--radius-sm, 6px)",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  marginInlineStart: "0.75rem",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                }}>
                  {lang === "ar" ? `خصم ${discountPercent}%` : `${discountPercent}% OFF`}
                </span>
              )}
            </div>

            {descStr && <p className={styles.brief}>{descStr}</p>}

            <div className={styles.divider}></div>

            {/* Color Swatch Selectors */}
            {(product as any).colors && (product as any).colors.length > 0 && (
              <div className={styles.selectorGroup}>
                <label className={styles.selectorLabel}>{t.selectColor}</label>
                <div className={styles.colorsRow}>
                  {((product as any).colors as string[]).map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`${styles.colorCircle} ${selectedColor === color ? styles.activeColorCircle : ""}`}
                      style={{ backgroundColor: color }}
                      title={color}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector Chips */}
            {product.priceOptions && product.priceOptions.length > 0 ? (
              <div className={styles.selectorGroup}>
                <label className={styles.selectorLabel}>{t.selectSize}</label>
                <div className={styles.sizesRow}>
                  {product.priceOptions.map((opt, idx) => {
                    const label = opt.sizeDisplay 
                      ? (typeof opt.sizeDisplay === "string" ? opt.sizeDisplay : opt.sizeDisplay[lang] || opt.sizeDisplay.ar)
                      : `${opt.quantity} ${opt.unit || ""}`;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedSize(label)}
                        className={`${styles.sizeChip} ${selectedSize === label ? styles.activeSizeChip : ""}`}
                      >
                        {label} - {formatPrice(opt.price, organizationPolicy?.logistics?.currency, lang)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (product as any).sizes && (product as any).sizes.length > 0 ? (
              <div className={styles.selectorGroup}>
                <label className={styles.selectorLabel}>{t.selectSize}</label>
                <div className={styles.sizesRow}>
                  {((product as any).sizes as string[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`${styles.sizeChip} ${selectedSize === size ? styles.activeSizeChip : ""}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Quantity Controller & Add to Cart */}
            <div className={styles.purchaseActionRow}>
              <div className={styles.qtyBox}>
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className={styles.qtyBtn}
                  disabled={qty <= 1}
                >
                  -
                </button>
                <span className={styles.qtyVal}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} className={styles.qtyBtn}>
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`glowButton ${styles.addToCartBtn} ${added ? styles.bouncing : ""}`}
              >
                {added ? `✔️ ${t.addedToCart}` : `🛒 ${t.addToCart}`}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Detail Tabs */}
        <div className={`${styles.tabsContainer} glassCard`}>
          <div className={styles.tabsHeader}>
            <button
              onClick={() => setActiveTab("desc")}
              className={`${styles.tabBtn} ${activeTab === "desc" ? styles.activeTabBtn : ""}`}
            >
              {t.description}
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`${styles.tabBtn} ${activeTab === "specs" ? styles.activeTabBtn : ""}`}
            >
              {t.specifications}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`${styles.tabBtn} ${activeTab === "reviews" ? styles.activeTabBtn : ""}`}
            >
              {t.reviews} ({reviewsVal})
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === "desc" && (
              <div className="animateFadeUp">
                <p>{detailedDesc}</p>
                <p style={{ marginTop: "1rem", opacity: 0.8 }}>
                  {lang === "ar"
                    ? "هذا المنتج مصمم بعناية فائقة ليلبي تطلعاتك ويلائم احتياجاتك اليومية. نضمن لك جودة عالية وخدمة عملاء على مدار الساعة."
                    : "This product is meticulously engineered to meet and exceed your expectations. We guarantee robust quality and reliable support."}
                </p>
              </div>
            )}

            {activeTab === "specs" && (
              <div className="animateFadeUp">
                <table className={styles.specsTable}>
                  <thead>
                    <tr>
                      <th>{t.specName}</th>
                      <th>{t.specValue}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specsList.map((spec: any, idx: number) => (
                      <tr key={idx}>
                        <td>{spec.name}</td>
                        <td>{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="animateFadeUp" style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                <div className={styles.reviewsList}>
                  {reviewsList.map((rev, index) => (
                    <div key={index} className={styles.reviewItem}>
                      <div className={styles.reviewHeader}>
                        <strong>{rev.name}</strong>
                        <div>
                          <span className={styles.reviewStars}>{"★".repeat(rev.stars) + "☆".repeat(5 - rev.stars)}</span>
                          <span style={{ fontSize: "0.8rem", opacity: 0.5, marginInlineStart: "0.5rem" }}>{rev.date}</span>
                        </div>
                      </div>
                      <p>{rev.text}</p>
                    </div>
                  ))}
                </div>

                {/* Write a Review form */}
                <div className={styles.addReviewBox}>
                  <h3>{lang === "ar" ? "أضف تقييمك للمنتج" : "Write a Review"}</h3>
                  <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
                    <div className={styles.ratingSelectRow}>
                      <span>{lang === "ar" ? "تقييمك بالنجوم:" : "Your Rating:"}</span>
                      <div className={styles.ratingStarsSelect}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewStars(star)}
                            className={`${styles.starBtn} ${reviewStars >= star ? styles.activeStar : ""}`}
                            aria-label={`Rate ${star} stars`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <input
                        type="text"
                        required
                        placeholder={lang === "ar" ? "الاسم الكريم" : "Your Name"}
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        className="customInput"
                      />
                    </div>
                    <textarea
                      required
                      rows={3}
                      placeholder={lang === "ar" ? "اكتب تعليقك وتقييمك هنا..." : "Write your review comment here..."}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="customInput"
                      style={{ resize: "vertical" }}
                    />
                    {reviewSuccess && (
                      <p className={styles.successMsg}>
                        🎉 {lang === "ar" ? "تم نشر تقييمك بنجاح! شكراً لك." : "Review submitted successfully! Thank you."}
                      </p>
                    )}
                    <button type="submit" className="glowButton">
                      {lang === "ar" ? "نشر التقييم" : "Submit Review"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
