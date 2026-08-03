"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import styles from "./BlogComponents.module.css";

interface CategoryPillsProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryPills({ activeCategory, onSelectCategory }: CategoryPillsProps) {
  const { lang, categories } = useApp();

  const presets = [
    { id: "all", label: { ar: "الكل", en: "All" } },
    { id: "tech", label: { ar: "التقنية", en: "Tech" } },
    { id: "coding", label: { ar: "البرمجة", en: "Coding" } },
    { id: "design", label: { ar: "التصميم", en: "Design" } },
    { id: "lifestyle", label: { ar: "نمط الحياة", en: "Lifestyle" } }
  ];

  const displayList = [
    { id: "all", label: { ar: "الكل", en: "All" } },
    ...categories.map((c) => {
      const nameStr = typeof c.name === "string" ? c.name : c.name?.[lang] || c.name?.ar || "";
      return {
        id: c.id,
        label: { ar: nameStr, en: nameStr },
      };
    })
  ];

  const finalCategories = displayList.length > 1 ? displayList : presets;

  return (
    <div className={styles.pillsWrapper}>
      <div className={styles.pillsContainer}>
        {finalCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`${styles.pill} ${activeCategory === cat.id ? styles.activePill : ""}`}
          >
            {cat.label[lang as keyof typeof cat.label]}
          </button>
        ))}
      </div>
    </div>
  );
}
