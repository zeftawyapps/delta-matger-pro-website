"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import styles from "./StoreComponents.module.css";

interface CategoryGridProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  title?: string;
  description?: string;
  variant?: string;
}

export default function CategoryGrid({ 
  activeCategory, 
  onSelectCategory, 
  title, 
  description,
  variant = "glass_card"
}: CategoryGridProps) {
  const { lang, t, productCategories } = useApp();

  const presets = [
    {
      id: "all",
      title: { ar: "الكل", en: "All Products" },
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300"
    },
    {
      id: "electronics",
      title: { ar: "الإلكترونيات", en: "Electronics" },
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300"
    },
    {
      id: "accessories",
      title: { ar: "الإسسوارات", en: "Accessories" },
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"
    },
    {
      id: "apparel",
      title: { ar: "الملابس", en: "Apparel" },
      image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300"
    }
  ];

  const displayList = [
    {
      id: "all",
      title: { ar: "الكل", en: "All Products" },
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300"
    },
    ...productCategories.map((c) => {
      const nameStr = typeof c.name === "string" ? c.name : c.name?.[lang] || c.name?.ar || "";
      return {
        id: c.id,
        title: { ar: nameStr, en: nameStr },
        image: c.imageUrl || c.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
      };
    })
  ];

  const finalCategories = displayList.length > 1 ? displayList : presets;

  return (
    <section className={`${styles.categorySection} animateFadeUp`}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleArea}>
          <h2 className={styles.sectionTitle}>{title || t.popularCategories}</h2>
          {description && <p className={styles.sectionSubtitle}>{description}</p>}
        </div>
      </div>
      
      {/* Horizontal scrollable categories list */}
      <div className={styles.categoryHorizontalList}>
        {finalCategories.map((cat) => {
          const name = cat.title[lang as keyof typeof cat.title];

          if (variant === "pills") {
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`${styles.categoryPill} ${activeCategory === cat.id ? styles.activeCategoryPill : ""}`}
                role="button"
                aria-pressed={activeCategory === cat.id}
              >
                {name}
              </button>
            );
          }

          if (variant === "round") {
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`${styles.categoryRoundItem} ${activeCategory === cat.id ? styles.activeCategoryRoundItem : ""}`}
                role="button"
                aria-pressed={activeCategory === cat.id}
              >
                <div className={styles.catRoundImgWrapper}>
                  <img src={cat.image} alt={name} className={styles.catRoundImg} />
                </div>
                <span>{name}</span>
              </div>
            );
          }

          // Default: glass_card
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`${styles.categoryCard} glassCard ${activeCategory === cat.id ? styles.activeCategoryCard : ""}`}
              role="button"
              aria-pressed={activeCategory === cat.id}
            >
              <div className={styles.catImgWrapper}>
                <img src={cat.image} alt={name} className={styles.catImg} />
              </div>
              <div className={styles.catOverlay}>
                <h3>{name}</h3>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
