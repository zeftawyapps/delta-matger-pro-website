"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { formatPrice } from "@/utils/currency";
import { isHtml } from "@/utils/html";
import { getFullImageUrl } from "@/services/api";
import { Product, ProductVariant, ProductVariantOption, ProductPriceOption } from "@/types";
import styles from "./ProductPage.module.css";

// Helper to extract localized text
function getLoc(val: any, lang: 'ar' | 'en'): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[lang] || val.ar || val.en || '';
}

// Helper to extract hex color code from a string (e.g. "رمادي (#757575)", "Navy Blue (#0D47A1)", or pure hex)
function parseColorHex(valueStr: string): string {
  if (!valueStr) return '#888888';
  const hexMatch = valueStr.match(/#([0-9a-fA-F]{3,8})/);
  if (hexMatch) {
    return hexMatch[0];
  }
  const lower = valueStr.toLowerCase().trim();
  if (lower.includes('أحمر') || lower.includes('احمر') || lower.includes('red')) return '#e53935';
  if (lower.includes('أزرق') || lower.includes('ازرق') || lower.includes('blue')) return '#1e88e5';
  if (lower.includes('كحلي') || lower.includes('navy')) return '#0d47a1';
  if (lower.includes('أخضر') || lower.includes('اخضر') || lower.includes('green')) return '#43a047';
  if (lower.includes('أصفر') || lower.includes('اصفر') || lower.includes('yellow')) return '#fdd835';
  if (lower.includes('رمادي') || lower.includes('grey') || lower.includes('gray')) return '#757575';
  if (lower.includes('أسود') || lower.includes('اسود') || lower.includes('black')) return '#212121';
  if (lower.includes('أبيض') || lower.includes('ابيض') || lower.includes('white')) return '#ffffff';
  if (lower.includes('وردي') || lower.includes('بمبي') || lower.includes('pink')) return '#e91e63';
  if (lower.includes('برتقالي') || lower.includes('orange')) return '#ff9800';
  if (lower.includes('بني') || lower.includes('brown')) return '#795548';
  if (lower.includes('بيج') || lower.includes('beige')) return '#f5f5dc';
  if (lower.includes('بنفسجي') || lower.includes('purple')) return '#9c27b0';
  
  return '#757575';
}

// Clean option label by removing (#HEX)
function cleanOptionLabel(valueStr: string): string {
  if (!valueStr) return '';
  return valueStr.replace(/\s*\([#0-9a-fA-F]+\)\s*/g, '').trim() || valueStr;
}

// Check if a variant group represents Colors
function isColorVariantGroup(name: string): boolean {
  const norm = name.toLowerCase();
  return norm.includes('لون') || norm.includes('الوان') || norm.includes('ألوان') || norm.includes('color') || norm.includes('colour');
}

// Check if a variant group represents Sizes
function isSizeVariantGroup(name: string): boolean {
  const norm = name.toLowerCase();
  return norm.includes('مقاس') || norm.includes('المقاس') || norm.includes('حجم') || norm.includes('الحجم') || norm.includes('size');
}

interface SelectedVariantState {
  groupName: string;
  optionLabel: string;
  cleanLabel: string;
  priceModifier: number;
  imageUrl?: string;
}

export default function ProductContent() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { addToCart, lang, t, products, productCategories, organizationPolicy } = useApp();

  // Find the active product from context list
  const product = products.find((p) => String(p.id) === String(id));

  // State controls
  const [activeImg, setActiveImg] = useState("");
  const [selectedVariants, setSelectedVariants] = useState<Record<string, SelectedVariantState>>({});
  const [selectedPriceOption, setSelectedPriceOption] = useState<ProductPriceOption | null>(null);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("desc");
  const [added, setAdded] = useState(false);

  // Extract all available variants from product
  const variantsList: ProductVariant[] = useMemo(() => {
    if (!product) return [];
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants;
    }
    const fromAdditional = product.additionalData?.variants;
    if (fromAdditional && Array.isArray(fromAdditional) && fromAdditional.length > 0) {
      return fromAdditional;
    }
    // Fallback: build variants from legacy colors/sizes arrays if present
    const legacyVariants: ProductVariant[] = [];
    const colors = (product as any).colors;
    if (Array.isArray(colors) && colors.length > 0) {
      legacyVariants.push({
        name: { ar: "اللون", en: "Color" },
        options: colors.map((c: string) => ({
          value: c,
          imageUrls: [],
          priceModifier: 0
        }))
      });
    }
    const sizes = (product as any).sizes;
    if (Array.isArray(sizes) && sizes.length > 0) {
      legacyVariants.push({
        name: { ar: "المقاس", en: "Size" },
        options: sizes.map((s: string) => ({
          value: s,
          imageUrls: [],
          priceModifier: 0
        }))
      });
    }
    return legacyVariants;
  }, [product]);

  // Sync initial selections on mount or product change
  useEffect(() => {
    if (product) {
      const rawMainImg = product.imageUrl || (product as any).image || product.imageUrls?.[0] || "";
      const mainImg = getFullImageUrl(rawMainImg);
      let initialImg = mainImg;

      // Initialize default selections for each variant group
      const initVariants: Record<string, SelectedVariantState> = {};
      if (variantsList.length > 0) {
        variantsList.forEach((vg) => {
          const gName = getLoc(vg.name, lang) || getLoc(vg.name, 'ar') || 'Variant';
          if (vg.options && vg.options.length > 0) {
            const firstOpt = vg.options[0];
            const optLabel = getLoc(firstOpt.value, lang) || getLoc(firstOpt.value, 'ar');
            const cleanLbl = cleanOptionLabel(optLabel);
            const firstImg = firstOpt.imageUrls && firstOpt.imageUrls.length > 0 ? getFullImageUrl(firstOpt.imageUrls[0]) : undefined;
            
            initVariants[gName] = {
              groupName: gName,
              optionLabel: optLabel,
              cleanLabel: cleanLbl,
              priceModifier: Number(firstOpt.priceModifier) || 0,
              imageUrl: firstImg,
            };

            // If this is a color group with an image, default the active image to it
            if (isColorVariantGroup(gName) && firstImg) {
              initialImg = firstImg;
            }
          }
        });
      }

      setSelectedVariants(initVariants);
      setActiveImg(initialImg);

      // Price options initialization
      if (product.priceOptions && product.priceOptions.length > 0) {
        setSelectedPriceOption(product.priceOptions[0]);
      } else {
        setSelectedPriceOption(null);
      }

      setQty(1);
    }
  }, [product, variantsList, lang]);

  // Specifications calculation strictly based on actual backend data
  const catObj = useMemo(() => {
    if (!product) return null;
    return productCategories.find((c) => c.id === product.categoryId);
  }, [product, productCategories]);

  const catLabel = catObj ? (typeof catObj.name === "string" ? catObj.name : catObj.name?.[lang] || catObj.name?.ar || "") : "";

  const specsList: { name: string; value: string }[] = useMemo(() => {
    if (!product) return [];
    const list: { name: string; value: string }[] = [];

    // 1. Raw specs from product or additionalData
    const rawSpecs = (product as any).specs || (product as any).additionalData?.specs || (product as any).additionalData?.specifications;
    if (Array.isArray(rawSpecs) && rawSpecs.length > 0) {
      rawSpecs.forEach((s: any) => {
        const sName = getLoc(s.name || s.key || s.title, lang);
        const sVal = getLoc(s.value || s.val, lang);
        if (sName && sVal) {
          list.push({ name: sName, value: String(sVal) });
        }
      });
    } else if (rawSpecs && typeof rawSpecs === "object") {
      Object.entries(rawSpecs).forEach(([k, v]) => {
        const sVal = getLoc(v, lang);
        if (k && sVal) {
          list.push({ name: k, value: String(sVal) });
        }
      });
    }

    // 2. Unit (if explicitly set)
    if (product.unit && !list.some((s) => s.name === (lang === "ar" ? "الوحدة" : "Unit"))) {
      list.push({ name: lang === "ar" ? "الوحدة" : "Unit", value: product.unit });
    }

    // 3. Category (if available)
    if (catLabel && !list.some((s) => s.name === (lang === "ar" ? "القسم" : "Category"))) {
      list.push({ name: lang === "ar" ? "القسم" : "Category", value: catLabel });
    }

    // 4. Variants list summary
    if (variantsList.length > 0) {
      variantsList.forEach((vg) => {
        const gTitle = getLoc(vg.name, lang);
        const optsStr = vg.options.map((opt) => cleanOptionLabel(getLoc(opt.value, lang))).filter(Boolean).join(", ");
        if (gTitle && optsStr && !list.some((s) => s.name === gTitle)) {
          list.push({ name: gTitle, value: optsStr });
        }
      });
    }

    return list;
  }, [product, lang, catLabel, variantsList]);

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
  const nameStr = getLoc(product.name, lang);
  const descStr = getLoc(product.description || product.additionalData?.description, lang);
  const detailedDesc = getLoc(product.additionalData?.detailedDescription, lang) || descStr;
  
  const rawMainImg = product.imageUrl || (product as any).image || product.imageUrls?.[0] || "";
  const mainImgUrl = getFullImageUrl(rawMainImg);
  
  // Gallery collection: main image + gallery + variant images
  const gallery: string[] = [];
  const sourceImages = [
    ...(Array.isArray(product.imageUrls) ? product.imageUrls : []),
    ...(Array.isArray(product.images) ? product.images : []),
  ];

  sourceImages.forEach((img) => {
    const full = getFullImageUrl(img);
    if (full && !gallery.includes(full)) gallery.push(full);
  });

  if (mainImgUrl && !gallery.includes(mainImgUrl)) {
    gallery.unshift(mainImgUrl);
  }

  // Calculate prices with modifiers
  const baseUnitPrice = selectedPriceOption ? selectedPriceOption.price : product.price;
  const baseOldPrice = selectedPriceOption ? selectedPriceOption.oldPrice : product.oldPrice;
  const productDiscount = product.discount;

  // Sum of price modifiers across all selected variants
  const totalModifiers = Object.values(selectedVariants).reduce(
    (sum, v) => sum + (v.priceModifier || 0),
    0
  );

  let activePrice = Math.max(0, baseUnitPrice + totalModifiers);
  let activeOldPrice = baseOldPrice != null && baseOldPrice > 0 ? Math.max(0, baseOldPrice + totalModifiers) : undefined;
  let discountPercent = 0;
  let hasDiscount = false;

  if (activeOldPrice != null && activeOldPrice > activePrice) {
    hasDiscount = true;
    discountPercent = Math.round(((activeOldPrice - activePrice) / activeOldPrice) * 100);
  } else if (productDiscount != null && productDiscount > 0) {
    hasDiscount = true;
    discountPercent = productDiscount;
    if (activeOldPrice == null || activeOldPrice <= activePrice) {
      activeOldPrice = activePrice;
      activePrice = Math.round((activePrice * (1 - productDiscount / 100)) * 100) / 100;
    }
  }

  // Handle selecting a variant option
  const handleSelectVariantOption = (
    vg: ProductVariant,
    opt: ProductVariantOption
  ) => {
    const gName = getLoc(vg.name, lang) || getLoc(vg.name, 'ar') || 'Variant';
    const optLabel = getLoc(opt.value, lang) || getLoc(opt.value, 'ar');
    const cleanLbl = cleanOptionLabel(optLabel);
    const img = opt.imageUrls && opt.imageUrls.length > 0 ? getFullImageUrl(opt.imageUrls[0]) : undefined;

    setSelectedVariants((prev) => ({
      ...prev,
      [gName]: {
        groupName: gName,
        optionLabel: optLabel,
        cleanLabel: cleanLbl,
        priceModifier: Number(opt.priceModifier) || 0,
        imageUrl: img,
      },
    }));

    // If the selected option has a dedicated photo, switch the gallery viewer immediately
    if (img) {
      setActiveImg(img);
    }
  };

  // Find currently selected Color & Size for cart payload
  let selectedColor = "";
  let selectedSize = "";
  const selectedVariantsDict: Record<string, string> = {};

  Object.entries(selectedVariants).forEach(([gName, val]) => {
    selectedVariantsDict[gName] = val.cleanLabel || val.optionLabel;
    if (isColorVariantGroup(gName)) {
      selectedColor = val.cleanLabel || val.optionLabel;
    } else if (isSizeVariantGroup(gName)) {
      selectedSize = val.cleanLabel || val.optionLabel;
    }
  });

  if (!selectedSize && selectedPriceOption) {
    selectedSize = selectedPriceOption.sizeDisplay
      ? (typeof selectedPriceOption.sizeDisplay === "string" ? selectedPriceOption.sizeDisplay : selectedPriceOption.sizeDisplay[lang] || selectedPriceOption.sizeDisplay.ar)
      : `${selectedPriceOption.quantity} ${selectedPriceOption.unit || ""}`;
  }

  const handleAddToCart = () => {
    const customizedProduct: Product = {
      ...product,
      imageUrl: activeImg || product.imageUrl,
      price: activePrice,
      oldPrice: activeOldPrice,
      discount: discountPercent || product.discount,
      additionalData: {
        ...product.additionalData,
        selectedColor: selectedColor || undefined,
        selectedSize: selectedSize || undefined,
        selectedPriceOptionKey: selectedSize || undefined,
        selectedVariants: selectedVariantsDict,
      }
    };
    addToCart(customizedProduct, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  // Determine if size variants are already handled by `variantsList`
  const hasSizeInVariants = variantsList.some((vg) => isSizeVariantGroup(getLoc(vg.name, 'en')) || isSizeVariantGroup(getLoc(vg.name, 'ar')));

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
              {hasDiscount && discountPercent > 0 && (
                <span className={styles.imgDiscountBadge}>
                  -{discountPercent}%
                </span>
              )}
              <img
                src={activeImg || mainImgUrl || (gallery.length > 0 ? gallery[0] : "")}
                alt={nameStr}
                className={styles.mainImg}
                onError={(e) => {
                  if (mainImgUrl && e.currentTarget.src !== mainImgUrl) {
                    e.currentTarget.src = mainImgUrl;
                  }
                }}
              />
            </div>
            {gallery.length > 1 && (
              <div className={styles.thumbnailsRow}>
                {gallery.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImg(img)}
                    className={`${styles.thumbBtn} glassCard ${(activeImg || mainImgUrl) === img ? styles.activeThumb : ""}`}
                  >
                    <img
                      src={img}
                      alt={nameStr}
                      onError={(e) => {
                        (e.currentTarget.parentElement as HTMLElement)?.style?.setProperty('display', 'none');
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Purchasing Options Column */}
          <div className={styles.optionsCol}>
            {catLabel && <span className={styles.categoryBadge}>{catLabel}</span>}
            <h1>{nameStr}</h1>

            {/* Price */}
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>{t.price}:</span>
              <span className={styles.priceVal}>{formatPrice(activePrice * qty, organizationPolicy?.logistics?.currency, lang)}</span>
              {hasDiscount && activeOldPrice && activeOldPrice > activePrice && (
                <span className={styles.oldPriceVal}>
                  {formatPrice(activeOldPrice * qty, organizationPolicy?.logistics?.currency, lang)}
                </span>
              )}
              {hasDiscount && discountPercent > 0 && (
                <span className={styles.discountBadge}>
                  {lang === "ar" ? `خصم ${discountPercent}%` : `${discountPercent}% OFF`}
                </span>
              )}
            </div>

            {descStr && <p className={styles.brief}>{descStr}</p>}

            <div className={styles.divider}></div>

            {/* Dynamic Product Variants (Colors, Sizes, Custom Variants) */}
            {variantsList.map((vg, vIdx) => {
              const gName = getLoc(vg.name, lang) || getLoc(vg.name, 'ar') || `Variant ${vIdx + 1}`;
              const isColor = isColorVariantGroup(gName) || isColorVariantGroup(getLoc(vg.name, 'en'));
              const selectedState = selectedVariants[gName];

              if (isColor) {
                return (
                  <div key={vIdx} className={styles.selectorGroup}>
                    <div className={styles.selectorLabelRow}>
                      <label className={styles.selectorLabel}>{gName}:</label>
                      {selectedState?.cleanLabel && (
                        <span className={styles.selectedValueBadge}>{selectedState.cleanLabel}</span>
                      )}
                    </div>
                    <div className={styles.colorsRow}>
                      {vg.options.map((opt, optIdx) => {
                        const optLabel = getLoc(opt.value, lang) || getLoc(opt.value, 'ar');
                        const cleanLbl = cleanOptionLabel(optLabel);
                        const hexColor = parseColorHex(optLabel);
                        const isSelected = selectedState?.optionLabel === optLabel;
                        const hasModifier = (opt.priceModifier || 0) !== 0;

                        return (
                          <div key={optIdx} className={styles.colorSwatchWrapper}>
                            <button
                              type="button"
                              onClick={() => handleSelectVariantOption(vg, opt)}
                              className={`${styles.colorCircle} ${isSelected ? styles.activeColorCircle : ""}`}
                              style={{ backgroundColor: hexColor }}
                              title={`${cleanLbl}${hasModifier ? ` (${opt.priceModifier! > 0 ? '+' : ''}${opt.priceModifier})` : ''}`}
                              aria-label={`Select color ${cleanLbl}`}
                            >
                              {isSelected && <span className={styles.colorCheckmark}>✓</span>}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              // Non-color variant (Sizes or Custom Variants)
              return (
                <div key={vIdx} className={styles.selectorGroup}>
                  <div className={styles.selectorLabelRow}>
                    <label className={styles.selectorLabel}>{gName}:</label>
                    {selectedState?.cleanLabel && (
                      <span className={styles.selectedValueBadge}>{selectedState.cleanLabel}</span>
                    )}
                  </div>
                  <div className={styles.sizesRow}>
                    {vg.options.map((opt, optIdx) => {
                      const optLabel = getLoc(opt.value, lang) || getLoc(opt.value, 'ar');
                      const cleanLbl = cleanOptionLabel(optLabel);
                      const isSelected = selectedState?.optionLabel === optLabel;
                      const hasModifier = (opt.priceModifier || 0) !== 0;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectVariantOption(vg, opt)}
                          className={`${styles.sizeChip} ${isSelected ? styles.activeSizeChip : ""}`}
                        >
                          <span>{cleanLbl}</span>
                          {hasModifier && (
                            <span className={styles.chipModifier}>
                              {opt.priceModifier! > 0 ? `+${opt.priceModifier}` : opt.priceModifier}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Price Options (Quantity packages / units) when no size variant exists */}
            {!hasSizeInVariants && product.priceOptions && product.priceOptions.length > 0 && (
              <div className={styles.selectorGroup}>
                <label className={styles.selectorLabel}>{t.selectSize || (lang === 'ar' ? 'الخيارات المتاحة' : 'Options')}</label>
                <div className={styles.sizesRow}>
                  {product.priceOptions.map((opt, idx) => {
                    const label = opt.sizeDisplay 
                      ? (typeof opt.sizeDisplay === "string" ? opt.sizeDisplay : opt.sizeDisplay[lang] || opt.sizeDisplay.ar)
                      : `${opt.quantity} ${opt.unit || ""}`;
                    const isSelected = selectedPriceOption === opt;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPriceOption(opt)}
                        className={`${styles.sizeChip} ${isSelected ? styles.activeSizeChip : ""}`}
                      >
                        {label} - {formatPrice(opt.price, organizationPolicy?.logistics?.currency, lang)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Controller & Add to Cart */}
            <div className={styles.purchaseActionRow}>
              <div className={styles.qtyBox}>
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className={styles.qtyBtn}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className={styles.qtyVal}>{qty}</span>
                <button 
                  onClick={() => setQty(qty + 1)} 
                  className={styles.qtyBtn}
                  aria-label="Increase quantity"
                >
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

        {/* Detail Tabs (Description & Specifications only) */}
        <div className={`${styles.tabsContainer} glassCard`}>
          <div className={styles.tabsHeader}>
            <button
              onClick={() => setActiveTab("desc")}
              className={`${styles.tabBtn} ${activeTab === "desc" ? styles.activeTabBtn : ""}`}
            >
              {t.description || (lang === "ar" ? "الوصف والتفاصيل" : "Description")}
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`${styles.tabBtn} ${activeTab === "specs" ? styles.activeTabBtn : ""}`}
            >
              {t.specifications || (lang === "ar" ? "المواصفات" : "Specifications")}
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === "desc" && (
              <div className="animateFadeUp">
                {isHtml(detailedDesc) ? (
                  <div
                    className={styles.descHtml}
                    dangerouslySetInnerHTML={{ __html: detailedDesc }}
                  />
                ) : (
                  <p>{detailedDesc || (lang === "ar" ? "لا يوجد وصف إضافي متوفر حالياً لهذا المنتج." : "No additional description available.")}</p>
                )}
              </div>
            )}

            {activeTab === "specs" && (
              <div className="animateFadeUp">
                {specsList.length > 0 ? (
                  <table className={styles.specsTable}>
                    <thead>
                      <tr>
                        <th>{t.specName || (lang === "ar" ? "المواصفة" : "Specification")}</th>
                        <th>{t.specValue || (lang === "ar" ? "القيمة" : "Value")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {specsList.map((spec, idx) => (
                        <tr key={idx}>
                          <td>{spec.name}</td>
                          <td>{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ opacity: 0.7 }}>
                    {lang === "ar" ? "لا توجد مواصفات إضافية مسجلة لهذا المنتج." : "No additional specifications recorded for this product."}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
