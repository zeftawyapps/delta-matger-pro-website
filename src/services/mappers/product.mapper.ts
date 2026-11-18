import { Product, ProductVariant } from "@/types";
import { getFullImageUrl } from "../client";

const ADDITIONAL_DATA_KEYS = [
  "description",
  "detailedDescription",
  "isDetailedDescriptionHtml",
  "usage",
  "benefits",
  "ingredients",
] as const;

export function normalizeVariants(
  rawVariants: any,
  productImages: string[] = []
): ProductVariant[] {
  if (!Array.isArray(rawVariants)) return [];
  return rawVariants
    .filter((v) => v && (v.name || v.options))
    .map((v) => ({
      name: v.name || "",
      options: Array.isArray(v.options)
        ? v.options.map((opt: any) => {
            const rawUrls = Array.isArray(opt.imageUrls)
              ? opt.imageUrls
              : opt.imageUrl
              ? [opt.imageUrl]
              : [];

            const resolvedUrls: string[] = [];
            rawUrls.forEach((ref: any) => {
              if (ref == null) return;
              const refStr = String(ref).trim();
              if (!refStr) return;

              if (/^\d+$/.test(refStr)) {
                const idx = parseInt(refStr, 10);
                if (idx >= 0 && idx < productImages.length) {
                  const resolved = productImages[idx];
                  if (resolved && !resolvedUrls.includes(resolved)) {
                    resolvedUrls.push(resolved);
                  }
                }
              } else {
                const full = getFullImageUrl(refStr);
                if (full && !resolvedUrls.includes(full)) {
                  resolvedUrls.push(full);
                }
              }
            });

            return {
              value: opt.value ?? "",
              imageUrls: resolvedUrls,
              priceModifier: Number(opt.priceModifier) || 0,
            };
          })
        : [],
    }));
}

function buildAdditionalData(
  raw: Record<string, any>,
  productImages: string[] = []
): Product["additionalData"] {
  const fromNested =
    raw.additionalData && typeof raw.additionalData === "object"
      ? { ...raw.additionalData }
      : {};

  for (const key of ADDITIONAL_DATA_KEYS) {
    if (raw[key] != null && fromNested[key] == null) {
      fromNested[key] = raw[key];
    }
  }

  const rawVariants =
    raw.variants || fromNested.variants || fromNested.additionalData?.variants;
  if (rawVariants) {
    fromNested.variants = normalizeVariants(rawVariants, productImages);
  }

  if (raw.addons || fromNested.addons) {
    fromNested.addons = raw.addons || fromNested.addons;
  }

  if (raw.options || fromNested.options) {
    fromNested.options = raw.options || fromNested.options;
  }

  return Object.keys(fromNested).length > 0 ? fromNested : undefined;
}

export function mapProductFromApi(raw: Record<string, any>): Product {
  const rawImagesList =
    raw.images && Array.isArray(raw.images) && raw.images.length > 0
      ? raw.images
      : raw.imageUrls && Array.isArray(raw.imageUrls) && raw.imageUrls.length > 0
      ? raw.imageUrls
      : [];

  const rawImages: string[] = [];
  rawImagesList.forEach((img: any) => {
    if (typeof img === "string" && img.trim()) {
      const full = getFullImageUrl(img);
      if (full && !rawImages.includes(full)) {
        rawImages.push(full);
      }
    }
  });

  if (raw.imageUrl || raw.image) {
    const single = getFullImageUrl(raw.imageUrl || raw.image);
    if (single && !rawImages.includes(single)) {
      rawImages.unshift(single);
    }
  }

  const additionalData = buildAdditionalData(raw, rawImages);
  const rawVariants =
    raw.variants ||
    additionalData?.variants ||
    raw.additionalData?.additionalData?.variants;
  const variants = normalizeVariants(rawVariants, rawImages);

  const variantImages: string[] = [];
  variants.forEach((v) => {
    v.options.forEach((opt) => {
      if (opt.imageUrls && opt.imageUrls.length > 0) {
        opt.imageUrls.forEach((img) => {
          if (img && !variantImages.includes(img) && !rawImages.includes(img)) {
            variantImages.push(img);
          }
        });
      }
    });
  });

  const allImages = [...rawImages, ...variantImages];
  const productImage =
    allImages.length > 0 ? allImages[0] : rawImages[0] || undefined;

  const rawBasePrice =
    typeof raw.price === "number" ? raw.price : parseFloat(raw.price) || 0;

  const rawOldPrice =
    raw.oldPrice != null
      ? Number(raw.oldPrice)
      : raw.originalPrice != null
      ? Number(raw.originalPrice)
      : raw.compareAtPrice != null
      ? Number(raw.compareAtPrice)
      : raw.priceBeforeDiscount != null
      ? Number(raw.priceBeforeDiscount)
      : raw.old_price != null
      ? Number(raw.old_price)
      : raw.additionalData?.oldPrice != null
      ? Number(raw.additionalData.oldPrice)
      : undefined;

  const rawDiscount =
    raw.discount != null
      ? Number(raw.discount)
      : raw.discountPercentage != null
      ? Number(raw.discountPercentage)
      : raw.discountPercent != null
      ? Number(raw.discountPercent)
      : raw.discount_percentage != null
      ? Number(raw.discount_percentage)
      : raw.activeOffer?.discountPercentage != null
      ? Number(raw.activeOffer.discountPercentage)
      : raw.additionalData?.discount != null
      ? Number(raw.additionalData.discount)
      : raw.additionalData?.discountPercentage != null
      ? Number(raw.additionalData.discountPercentage)
      : undefined;

  const rawDiscountedPrice =
    raw.discountedPrice != null
      ? Number(raw.discountedPrice)
      : raw.priceAfterDiscount != null
      ? Number(raw.priceAfterDiscount)
      : undefined;

  let finalPrice = rawBasePrice;
  let finalOldPrice = rawOldPrice;
  let finalDiscount = rawDiscount;

  if (finalOldPrice != null && finalOldPrice > finalPrice) {
    if (!finalDiscount) {
      finalDiscount = Math.round(
        ((finalOldPrice - finalPrice) / finalOldPrice) * 100
      );
    }
  } else if (rawDiscountedPrice != null && rawDiscountedPrice < finalPrice) {
    finalOldPrice = finalPrice;
    finalPrice = rawDiscountedPrice;
    if (!finalDiscount) {
      finalDiscount = Math.round(
        ((finalOldPrice - finalPrice) / finalOldPrice) * 100
      );
    }
  } else if (
    finalDiscount != null &&
    finalDiscount > 0 &&
    finalDiscount < 100
  ) {
    if (finalOldPrice == null || finalOldPrice <= finalPrice) {
      finalOldPrice = finalPrice;
      finalPrice =
        Math.round(finalPrice * (1 - finalDiscount / 100) * 100) / 100;
    }
  }

  const normalizedPriceOptions = Array.isArray(raw.priceOptions)
    ? raw.priceOptions.map((opt: any) => {
        const optPrice = Number(opt.price) || 0;
        let optOldPrice =
          opt.oldPrice != null ? Number(opt.oldPrice) : undefined;
        let optFinalPrice = optPrice;

        if (optOldPrice != null && optOldPrice > optPrice) {
          optFinalPrice = optPrice;
        } else if (
          finalDiscount != null &&
          finalDiscount > 0 &&
          finalDiscount < 100
        ) {
          optOldPrice = optPrice;
          optFinalPrice =
            Math.round(optPrice * (1 - finalDiscount / 100) * 100) / 100;
        }

        return {
          ...opt,
          price: optFinalPrice,
          oldPrice: optOldPrice,
        };
      })
    : undefined;

  return {
    id: raw.id || raw.productId || raw._id,
    name: raw.name || "",
    description: raw.description ?? additionalData?.description,
    price: finalPrice,
    oldPrice: finalOldPrice,
    unit: raw.unit || "pcs",
    discount: finalDiscount,
    priceOptions: normalizedPriceOptions,
    variants: variants.length > 0 ? variants : undefined,
    addons: Array.isArray(raw.addons) ? raw.addons : additionalData?.addons,
    options: Array.isArray(raw.options) ? raw.options : additionalData?.options,
    minPrice: raw.minPrice,
    maxPrice: raw.maxPrice,
    hasMultipleSizes: raw.hasMultipleSizes,
    imageUrl: productImage,
    imageUrls: allImages,
    isActive: raw.isActive !== false,
    isNew: raw.isNew === true,
    isBestSeller: raw.isBestSeller === true,
    isOnSale: raw.isOnSale === true,
    isJoker: raw.isJoker === true,
    isSuperJoker: raw.isSuperJoker === true,
    categoryId: raw.categoryId || raw.category || "",
    organizationId: raw.organizationId || "",
    additionalData,
  };
}

