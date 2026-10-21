"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { Product } from "@/types";
import { formatPrice } from "@/utils/currency";
import { getFullImageUrl } from "@/services/api";
import styles from "./StoreComponents.module.css";

interface ProductGridProps {
  products: Product[];
  /** Number of columns (maps to config.crossAxisCount). Falls back to responsive auto-fill. */
  columns?: number;
}

export default function ProductGrid({ products, columns }: ProductGridProps) {
  const { addToCart, t, lang, productCategories, organizationPolicy } = useApp();
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const gridStyle = columns
    ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
    : undefined;

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let effectivePrice = product.price;
    let effectiveOldPrice = product.oldPrice;
    if (product.discount && product.discount > 0 && (!effectiveOldPrice || effectiveOldPrice <= effectivePrice)) {
      effectiveOldPrice = effectivePrice;
      effectivePrice = Math.round((effectivePrice * (1 - product.discount / 100)) * 100) / 100;
    }

    addToCart({
      ...product,
      price: effectivePrice,
      oldPrice: effectiveOldPrice,
    }, 1);
    
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 1600);
  };

  const handleImageError = (productId: string) => {
    setBrokenImages((prev) => ({ ...prev, [productId]: true }));
  };

  return (
    <section className={styles.productSection}>
      <div className={styles.productsGrid} style={gridStyle}>
        {products.map((product) => {
          const nameStr = typeof product.name === "string" ? product.name : product.name?.[lang] || product.name?.ar || "";
          const rawImg = product.imageUrl || (product as any).image || product.imageUrls?.[0] || "";
          const imgUrl = getFullImageUrl(rawImg);
          const hasBrokenImg = brokenImages[product.id] || !rawImg;

          const ratingVal = (product as any).rating || 5;
          const reviewsVal = (product as any).reviewsCount || 12;

          const catObj = productCategories.find((c) => c.id === product.categoryId);
          const catLabel = catObj ? (typeof catObj.name === "string" ? catObj.name : catObj.name?.[lang] || catObj.name?.ar || "") : "";

          // Pricing & Discount logic
          let displayPrice = product.price;
          let displayOldPrice = product.oldPrice;
          let discountPercent = 0;
          let hasDiscount = false;

          if (displayOldPrice && displayOldPrice > displayPrice) {
            hasDiscount = true;
            discountPercent = Math.round(((displayOldPrice - displayPrice) / displayOldPrice) * 100);
          } else if (product.discount && product.discount > 0) {
            hasDiscount = true;
            discountPercent = product.discount;
            if (!displayOldPrice || displayOldPrice <= displayPrice) {
              displayOldPrice = displayPrice;
              displayPrice = Math.round((displayPrice * (1 - product.discount / 100)) * 100) / 100;
            }
          }

          const isNew = product.isNew;
          const isBestSeller = product.isBestSeller;

          return (
            <div key={product.id} className={`${styles.productCard} glassCard animateFadeUp`}>
              <Link href={`/store/${product.id}`} className={styles.productLink}>
                <div className={styles.productImgWrapper}>
                  {!hasBrokenImg ? (
                    <img
                      src={imgUrl}
                      alt={nameStr}
                      className={styles.productImg}
                      loading="lazy"
                      onError={() => handleImageError(product.id)}
                    />
                  ) : (
                    <div className={styles.productImgFallback}>
                      <span className={styles.fallbackIcon}>🛍️</span>
                      <span className={styles.fallbackText}>{nameStr.slice(0, 15)}</span>
                    </div>
                  )}

                  {/* Badges container */}
                  <div className={styles.badgesContainer}>
                    {hasDiscount && discountPercent > 0 ? (
                      <span className={`${styles.productBadge} ${styles.badgeDiscount}`}>
                        -{discountPercent}%
                      </span>
                    ) : null}
                    {isBestSeller && (
                      <span className={`${styles.productBadge} ${styles.badgeBestSeller}`}>
                        🔥 {lang === "ar" ? "الأكثر مبيعاً" : "Best Seller"}
                      </span>
                    )}
                    {isNew && !isBestSeller && (
                      <span className={`${styles.productBadge} ${styles.badgeNew}`}>
                        ✨ {lang === "ar" ? "جديد" : "New"}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className={styles.productBody}>
                  {catLabel && <span className={styles.productCat}>{catLabel}</span>}
                  <h3 className={styles.productTitle}>{nameStr}</h3>
                  
                  {/* Rating */}
                  <div className={styles.ratingRow}>
                    <div className={styles.starsWrapper}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      <span className={styles.ratingScore}>{typeof ratingVal === 'number' ? ratingVal.toFixed(1) : '5.0'}</span>
                    </div>
                    <span className={styles.ratingCount}>({reviewsVal})</span>
                  </div>

                  <div className={styles.priceRow}>
                    <div className={styles.priceCol}>
                      <span className={styles.productPrice}>
                        {formatPrice(displayPrice, organizationPolicy?.logistics?.currency, lang)}
                      </span>
                      {hasDiscount && displayOldPrice && displayOldPrice > displayPrice && (
                        <span className={styles.productOldPrice}>
                          {formatPrice(displayOldPrice, organizationPolicy?.logistics?.currency, lang)}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(product, e)}
                      className={`${styles.quickAddBtn} ${addedProductId === product.id ? styles.added : ""}`}
                      aria-label={addedProductId === product.id ? t.addedToCart : t.addToCart}
                      title={addedProductId === product.id ? t.addedToCart : t.addToCart}
                    >
                      {addedProductId === product.id ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="8" cy="21" r="1"/>
                          <circle cx="19" cy="21" r="1"/>
                          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
