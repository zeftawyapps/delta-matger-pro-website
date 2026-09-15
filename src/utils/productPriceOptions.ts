import { Product, ProductPriceOption } from '../types';

export interface OptionPricing {
  unitBasePrice: number;
  unitOldPrice?: number;
  unitFinalPrice: number;
  discountPercent: number;
  hasDiscount: boolean;
}

export interface ResolvedProductPricing extends OptionPricing {
  quantity: number;
  totalFinalPrice: number;
  totalOldPrice?: number;
  totalSavings: number;
}

function roundPrice(value: number): number {
  return Math.round(value * 100) / 100;
}

export function getOptionLabel(opt: ProductPriceOption, lang: 'ar' | 'en'): string {
  if (opt.sizeDisplay) {
    if (typeof opt.sizeDisplay === 'string') return opt.sizeDisplay;
    return opt.sizeDisplay[lang] || opt.sizeDisplay.ar || opt.sizeDisplay.en || '';
  }
  if (opt.quantity && opt.unit) {
    return `${opt.quantity} ${opt.unit}`;
  }
  return lang === 'ar' ? 'الخيار' : 'Option';
}

/** Calculate final unit price & discount for a given base price (selected option or product). */
export function resolveOptionPricing(
  unitPrice: number,
  unitOldPrice: number | undefined,
  productDiscount: number | undefined
): OptionPricing {
  // 1) oldPrice discount on the selected price
  if (unitOldPrice != null && unitOldPrice > unitPrice) {
    return {
      unitBasePrice: unitPrice,
      unitOldPrice,
      unitFinalPrice: unitPrice,
      discountPercent: Math.round(((unitOldPrice - unitPrice) / unitOldPrice) * 100),
      hasDiscount: true,
    };
  }

  // 2) percentage discount applied on the selected price
  if (productDiscount != null && productDiscount > 0) {
    const unitFinalPrice = roundPrice(unitPrice - (unitPrice * productDiscount) / 100);
    return {
      unitBasePrice: unitPrice,
      unitOldPrice: unitPrice,
      unitFinalPrice,
      discountPercent: productDiscount,
      hasDiscount: true,
    };
  }

  return {
    unitBasePrice: unitPrice,
    unitFinalPrice: unitPrice,
    discountPercent: 0,
    hasDiscount: false,
  };
}

export function resolveProductPricing(
  product: Product,
  selectedOption: ProductPriceOption | null,
  quantity: number
): ResolvedProductPricing {
  const unitPrice = selectedOption?.price ?? product.price;
  const unitOldPrice = selectedOption?.oldPrice ?? product.oldPrice;

  const optionPricing = resolveOptionPricing(unitPrice, unitOldPrice, product.discount);
  const safeQty = Math.max(1, quantity);

  const totalFinalPrice = roundPrice(optionPricing.unitFinalPrice * safeQty);
  const totalOldPrice = optionPricing.unitOldPrice != null
    ? roundPrice(optionPricing.unitOldPrice * safeQty)
    : undefined;
  const totalSavings = totalOldPrice != null
    ? roundPrice(totalOldPrice - totalFinalPrice)
    : 0;

  return {
    ...optionPricing,
    quantity: safeQty,
    totalFinalPrice,
    totalOldPrice,
    totalSavings,
  };
}

export function resolveProductPriceOptions(product: Product): ProductPriceOption[] {
  if (product.priceOptions && product.priceOptions.length > 0) {
    return product.priceOptions;
  }
  return [];
}

export function getDefaultOptionIndex(options: ProductPriceOption[]): number {
  const idx = options.findIndex(o => o.isDefault);
  return idx >= 0 ? idx : 0;
}

export function buildProductForCart(
  product: Product,
  selectedOption: ProductPriceOption | null
): Product {
  const pricing = resolveProductPricing(product, selectedOption, 1);
  const label = selectedOption ? getOptionLabel(selectedOption, 'ar') : undefined;

  return {
    ...product,
    price: pricing.unitFinalPrice,
    oldPrice: pricing.unitOldPrice,
    unit: typeof selectedOption?.unit === 'string' ? selectedOption.unit : product.unit,
    additionalData: {
      ...product.additionalData,
      ...(label ? { selectedPriceOptionKey: label, selectedSize: label } : {}),
    },
  };
}

export function getCartLineKey(product: Product): string {
  const sizeKey = product.additionalData?.selectedPriceOptionKey || product.additionalData?.selectedSize || 'default';
  const colorKey = product.additionalData?.selectedColor || '';
  const variantsKey = product.additionalData?.selectedVariants
    ? Object.entries(product.additionalData.selectedVariants)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v}`)
        .join('|')
    : '';
  return `${product.id}::${sizeKey}::${colorKey}::${variantsKey}`;
}

/** Pricing display for a cart line (product.price is already the discounted unit price). */
export function getCartLinePricing(product: Product, quantity: number) {
  const unitFinalPrice = product.price;
  const unitOldPrice = product.oldPrice != null && product.oldPrice > unitFinalPrice
    ? product.oldPrice
    : undefined;
  const hasDiscount = unitOldPrice != null;
  const discountPercent = hasDiscount
    ? Math.round(((unitOldPrice! - unitFinalPrice) / unitOldPrice!) * 100)
    : 0;

  return {
    unitFinalPrice,
    unitOldPrice,
    hasDiscount,
    discountPercent,
    lineTotal: roundPrice(unitFinalPrice * quantity),
    lineOldTotal: unitOldPrice != null ? roundPrice(unitOldPrice * quantity) : undefined,
    savings: unitOldPrice != null ? roundPrice((unitOldPrice - unitFinalPrice) * quantity) : 0,
  };
}
