"use client";

import { useMemo, useCallback } from "react";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * Custom hook to compute cart summary, tier discounts (slices),
 * shipping fee (by governorate), VAT, and final total.
 * Subscribes only to Cart and Auth policies via Zustand selectors.
 */
export function useCartSummary() {
  const cart = useCartStore((s) => s.cart);
  const organizationPolicy = useAuthStore((s) => s.organizationPolicy);
  const profile = useAuthStore((s) => s.profile);

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + item.product.price * item.quantity, 0),
    [cart]
  );

  const slices = organizationPolicy?.salesRules?.invoiceSlices || [];

  const sliceDiscount = useMemo(() => {
    if (slices.length === 0) return 0;
    const applicableSlices = slices.filter((s) => subtotal >= s.minAmount);
    if (applicableSlices.length === 0) return 0;
    const bestSlice = applicableSlices.reduce(
      (prev, curr) => (curr.minAmount > prev.minAmount ? curr : prev),
      applicableSlices[0]
    );
    return bestSlice.discountAmount;
  }, [slices, subtotal]);

  const calculateShippingForGov = useCallback(
    (govId?: string): number => {
      if (!organizationPolicy?.shipping) return 0;
      if (organizationPolicy.shipping.freeShippingEnabled === true) return 0;

      let fee = organizationPolicy.shipping.defaultFee || 0;
      if (govId && organizationPolicy.shipping.feesByGovernorate) {
        const govFee =
          organizationPolicy.shipping.feesByGovernorate[govId] ??
          organizationPolicy.shipping.feesByGovernorate[govId.replace("eg_", "")];
        if (typeof govFee === "number") {
          fee = govFee;
        }
      }
      return fee;
    },
    [organizationPolicy]
  );

  const shippingFee = useMemo(
    () => calculateShippingForGov(profile?.governorateId),
    [calculateShippingForGov, profile?.governorateId]
  );

  const enableVat = organizationPolicy?.logistics?.enableVat === true;
  const taxPercentage = organizationPolicy?.logistics?.taxPercentage || 0;

  const vatAmount = useMemo(() => {
    if (!enableVat || taxPercentage <= 0) return 0;
    const taxableAmount = Math.max(0, subtotal - sliceDiscount);
    return taxableAmount * (taxPercentage / 100);
  }, [enableVat, taxPercentage, subtotal, sliceDiscount]);

  const finalTotal = useMemo(
    () => Math.max(0, subtotal - sliceDiscount + shippingFee + vatAmount),
    [subtotal, sliceDiscount, shippingFee, vatAmount]
  );

  return {
    cartCount,
    subtotal,
    slices,
    sliceDiscount,
    shippingFee,
    calculateShippingForGov,
    enableVat,
    taxPercentage,
    vatAmount,
    finalTotal,
    currency: organizationPolicy?.logistics?.currency,
  };
}

