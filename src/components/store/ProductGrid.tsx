"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { Product } from "@/types";
import { formatPrice } from "@/utils/currency";
import styles from "./StoreComponents.module.css";

interface ProductGridProps {
  products: Product[];
  /** Number of columns (maps to config.crossAxisCount). Falls back to responsive auto-fill. */
  columns?: number;
}

export default function ProductGrid({ products, columns }: ProductGridProps) {
  const { addToCart, t, lang, productCategories, organizationPolicy } = useApp();
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const gridStyle = columns
    ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
    : undefined;

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 1500);
  };

  return (
    <section className={styles.productSection}>
      <div className={styles.productsGrid} style={gridStyle}>
        {products.map((product) => {
          const nameStr = typeof product.name === "string" ? product.name : product.name?.[lang] || product.name?.ar || "";
          const imgUrl = product.imageUrl || (product as any).image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600";
          
          const ratingVal = (product as any).rating || 5;
          const reviewsVal = (product as any).reviewsCount || 12;

          const catObj = productCategories.find((c) => c.id === product.categoryId);
          const catLabel = catObj ? (typeof catObj.name === "string" ? catObj.name : catObj.name?.[lang] || catObj.name?.ar || "") : "";

          return (
            <div key={product.id} className={`${styles.productCard} glassCard animateFadeUp`}>
              <Link href={`/store/${product.id}`} className={styles.productLink}>
                <div className={styles.productImgWrapper}>
                  <img src={imgUrl} alt={nameStr} className={styles.productImg} />
                  {product.price > 150 && <span className={styles.saleBadge}>{lang === "ar" ? "مميز" : "Featured"}</span>}
                </div>
                
                <div className={styles.productBody}>
                  {catLabel && <span className={styles.productCat}>{catLabel}</span>}
                  <h3 className={styles.productTitle}>{nameStr}</h3>
                  
                  {/* Rating */}
                  <div className={styles.ratingRow}>
                    <span className={styles.stars}>
                      {"★".repeat(Math.floor(ratingVal)) + "☆".repeat(5 - Math.floor(ratingVal))}
                    </span>
                    <span className={styles.ratingText}>({reviewsVal})</span>
                  </div>

                  <div className={styles.priceRow}>
                    <span className={styles.productPrice}>
                      {formatPrice(product.price, organizationPolicy?.logistics?.currency, lang)}
                    </span>
                    <button
                      onClick={(e) => handleQuickAdd(product, e)}
                      className={`${styles.quickAddBtn} ${addedProductId === product.id ? styles.added : ""}`}
                      disabled={addedProductId === product.id}
                    >
                      {addedProductId === product.id ? "✔️" : "🛒"}
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
