"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useCartSummary } from "@/hooks/useCartSummary";
import { api } from "@/services/api";
import clientConfig from "@/config/clientConfig.json";
import { clearCampaignAttribution } from "@/utils/campaignTracker";
import { formatPrice } from "@/utils/currency";
import styles from "@/components/Navbar/Navbar.module.css";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccessViewOrders: () => void;
  onContinueShopping: () => void;
  onRequireLogin: () => void;
}

interface OrderSuccessData {
  orderId: string;
  total: number;
  itemsCount: number;
  recipientName: string;
  recipientPhone: string;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  onOrderSuccessViewOrders,
  onContinueShopping,
  onRequireLogin,
}: CheckoutModalProps) {
  const {
    config,
    lang,
    cart,
    clearCart,
    currentUser,
    profile,
    authToken,
    organizationPolicy,
  } = useApp();

  const {
    subtotal,
    slices,
    sliceDiscount,
    calculateShippingForGov,
    enableVat,
    taxPercentage,
    vatAmount,
    currency,
  } = useCartSummary();

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [orderSuccessData, setOrderSuccessData] = useState<OrderSuccessData | null>(null);
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutGovernorate, setCheckoutGovernorate] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [checkoutGovList, setCheckoutGovList] = useState<any[]>([]);
  const [checkoutCity, setCheckoutCity] = useState("");
  const [checkoutCityList, setCheckoutCityList] = useState<any[]>([]);

  // Reset and pre-fill checkout fields when modal opens
  useEffect(() => {
    if (isOpen) {
      setCheckoutError("");
      setOrderSuccessData(null);
      const initName = currentUser?.name || profile?.name || profile?.username || "";
      const initPhone = profile?.phone || currentUser?.phone || "";
      const initAddress = profile?.address || "";
      const initGov = profile?.governorateId || "";
      const initCity = profile?.cityId || "";

      setCheckoutName(initName);
      setCheckoutPhone(initPhone);
      setCheckoutAddress(initAddress);
      setCheckoutGovernorate(initGov);
      setCheckoutCity(initCity);

      (async () => {
        try {
          const govs = await api.getGovernorates("EG").catch(() => []);
          setCheckoutGovList(govs);

          if (initGov) {
            const cts = await api.getCities(initGov).catch(() => []);
            setCheckoutCityList(cts);
          }
        } catch (err) {
          console.error("Error loading checkout locations:", err);
        }
      })();
    }
  }, [isOpen, profile, currentUser]);

  const handleCheckoutGovChange = async (newGovId: string) => {
    setCheckoutGovernorate(newGovId);
    setCheckoutCity("");
    setCheckoutCityList([]);
    if (newGovId) {
      try {
        const cts = await api.getCities(newGovId);
        setCheckoutCityList(cts);
      } catch (err) {
        console.error("Error loading checkout cities:", err);
      }
    }
  };

  const handleClose = () => {
    if (!checkoutLoading) {
      setOrderSuccessData(null);
      onClose();
    }
  };

  const currentShippingFee = calculateShippingForGov(checkoutGovernorate);
  const currentGrandTotal = Math.max(0, subtotal - sliceDiscount + currentShippingFee + vatAmount);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError("");
    if (!authToken || !currentUser) {
      alert(lang === "ar" ? "يرجى تسجيل الدخول أولاً." : "Please log in first.");
      onRequireLogin();
      onClose();
      return;
    }

    setCheckoutLoading(true);
    try {
      const finalShippingFee = calculateShippingForGov(checkoutGovernorate);

      const orderItems = cart.map((item) => {
        const baseName =
          typeof item.product.name === "string"
            ? item.product.name
            : item.product.name?.[lang] || item.product.name?.ar || "";

        const variantParts: string[] = [];
        if (item.product.additionalData?.selectedVariants) {
          Object.entries(item.product.additionalData.selectedVariants).forEach(([k, v]) => {
            variantParts.push(`${k}: ${v}`);
          });
        } else {
          if (item.product.additionalData?.selectedColor) {
            variantParts.push(
              `${lang === "ar" ? "اللون" : "Color"}: ${item.product.additionalData.selectedColor}`
            );
          }
          if (
            item.product.additionalData?.selectedPriceOptionKey ||
            item.product.additionalData?.selectedSize
          ) {
            variantParts.push(
              `${lang === "ar" ? "المقاس" : "Size"}: ${
                item.product.additionalData.selectedPriceOptionKey ||
                item.product.additionalData.selectedSize
              }`
            );
          }
        }

        return {
          id: item.product.id,
          name: baseName,
          description: variantParts.length > 0 ? variantParts.join(" | ") : undefined,
          quantity: item.quantity,
          unitPrice: item.product.price,
          totalPrice: item.product.price * item.quantity,
        };
      });

      const orderTotal = Math.max(0, subtotal - sliceDiscount + finalShippingFee + vatAmount);

      const orgId = config.id || clientConfig.defaultOrgName;
      const customerShippingInfo = {
        name: checkoutName,
        phone: checkoutPhone,
        address: checkoutAddress,
        countryId: profile?.countryId || "EG",
        governorateId: checkoutGovernorate,
        cityId: checkoutCity || "Cairo",
        latitude: profile?.location?.latitude || 30.0444,
        longitude: profile?.location?.longitude || 31.2357,
      };

      const orderSettings = config?.website?.orderSettings || {};
      const workflowSlug =
        orderSettings.workflowSlug !== undefined ? orderSettings.workflowSlug : null;
      const allowDefaultWorkflow = orderSettings.allowDefaultWorkflow ?? true;
      const calculationMode = orderSettings.calculationMode ?? 2;
      const orderMode = orderSettings.orderMode || "C2B";

      const createdOrder = await api.createOrder({
        organizationId: orgId,
        token: authToken,
        items: orderItems,
        totalOrderPrice: orderTotal,
        senderDetails: customerShippingInfo,
        recipientDetails: null,
        additionalCalculation: {
          discountAmount: -sliceDiscount,
          shippingFee: finalShippingFee,
          vatAmount,
        },
        workflowSlug,
        allowDefaultWorkflow,
        calculationMode,
        orderMode,
      });

      clearCart();
      clearCampaignAttribution();
      setOrderSuccessData({
        orderId:
          (createdOrder as any)?.id ||
          (createdOrder as any)?._id ||
          `ORD-${Date.now().toString().slice(-6)}`,
        total: orderTotal,
        itemsCount: orderItems.reduce((sum, item) => sum + item.quantity, 0),
        recipientName: checkoutName,
        recipientPhone: checkoutPhone,
      });
    } catch (err: any) {
      console.error("Order submission failed:", err);
      const errMsg =
        err.message ||
        (lang === "ar"
          ? "تعذر إرسال الطلب، يرجى المحاولة مرة أخرى."
          : "Could not place order, please try again.");
      setCheckoutError(errMsg);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div
        className={`${styles.loginModal} ${lang === "ar" ? styles.rtl : styles.ltr}`}
        style={{ maxWidth: "860px", width: "95%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            setOrderSuccessData(null);
            onClose();
          }}
          className={styles.modalCloseBtn}
          aria-label={lang === "ar" ? "إغلاق" : "Close"}
        >
          ✕
        </button>

        {orderSuccessData ? (
          <div className="orderSuccessCard">
            <div className="orderSuccessIconWrapper">
              <span>✓</span>
            </div>

            <h3 className="orderSuccessTitle">
              {lang === "ar"
                ? "🎉 تم استلام وتأكيد طلبك بنجاح!"
                : "🎉 Order Placed Successfully!"}
            </h3>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "color-mix(in srgb, var(--primary) 10%, transparent)",
                padding: "0.4rem 1rem",
                borderRadius: "20px",
                fontSize: "0.9rem",
                fontWeight: "700",
                color: "var(--primary)",
              }}
            >
              <span>{lang === "ar" ? "رقم الطلب:" : "Order ID:"}</span>
              <span>#{orderSuccessData.orderId.toString().slice(-8).toUpperCase()}</span>
            </div>

            <p className="orderSuccessSubtitle">
              {lang === "ar"
                ? `شكراً لثقتك بنا يا ${orderSuccessData.recipientName}. تم تسجيل طلبك المكون من (${orderSuccessData.itemsCount}) منتجات بإجمالي ${formatPrice(orderSuccessData.total, currency, lang)}، وسنتواصل معك قريباً على رقم ${orderSuccessData.recipientPhone} لتأكيد موعد التسليم.`
                : `Thank you for your order, ${orderSuccessData.recipientName}! Your order of (${orderSuccessData.itemsCount}) items with a total of ${formatPrice(orderSuccessData.total, currency, lang)} has been received. We will contact you soon on ${orderSuccessData.recipientPhone}.`}
            </p>

            <div className="orderSuccessActions">
              <button
                type="button"
                onClick={() => {
                  setOrderSuccessData(null);
                  onOrderSuccessViewOrders();
                }}
                className="glowButton"
                style={{ flex: 1, justifyContent: "center", padding: "0.8rem", fontSize: "0.95rem" }}
              >
                <span>📦</span>
                <span>{lang === "ar" ? "عرض تفاصيل طلباتي" : "View My Orders"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOrderSuccessData(null);
                  onContinueShopping();
                }}
                style={{
                  flex: 1,
                  padding: "0.8rem",
                  fontSize: "0.95rem",
                  borderRadius: "var(--radius-sm, 8px)",
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  color: "var(--fg)",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                }}
              >
                {lang === "ar" ? "متابعة التسوق ➔" : "Continue Shopping ➔"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3
              style={{
                textAlign: "center",
                marginBottom: "0.25rem",
                fontSize: "1.35rem",
                fontWeight: "800",
              }}
            >
              <span>🛒</span>{" "}
              {lang === "ar" ? "تأكيد تفاصيل الشحن والطلب" : "Confirm Shipping & Order Details"}
            </h3>
            <p
              style={{
                textAlign: "center",
                fontSize: "0.88rem",
                opacity: 0.75,
                marginBottom: "1.25rem",
              }}
            >
              {lang === "ar"
                ? "يرجى مراجعة وتأكيد عنوان الاستلام لحساب إجمالي الطلب شاملاً الشحن بدقة."
                : "Please review and confirm your shipping address to calculate final total accurately."}
            </p>

            {checkoutError && (
              <div className="inlineErrorBanner" style={{ marginBottom: "1rem" }}>
                <span>⚠️</span>
                <span>{checkoutError}</span>
              </div>
            )}

            <form onSubmit={handleCheckoutSubmit}>
              <div className="checkoutGridContainer">
                {/* Left Card: Customer & Shipping Information */}
                <div className="checkoutSectionCard">
                  <div className="checkoutSectionHeader">
                    <span>📍</span>
                    <span>
                      {lang === "ar" ? "بيانات المستلم والتوصيل" : "Recipient & Delivery Info"}
                    </span>
                  </div>

                  <div className="customInputGroup">
                    <label className="inputLabel">
                      <span className="labelIcon">👤</span>
                      <span>{lang === "ar" ? "الاسم الكامل" : "Full Name"}</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={lang === "ar" ? "مثال: أحمد محمد علي" : "e.g. John Doe"}
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      className="customInput"
                    />
                  </div>

                  <div className="customInputGroup">
                    <label className="inputLabel">
                      <span className="labelIcon">📱</span>
                      <span>{lang === "ar" ? "رقم الهاتف للتواصل" : "Phone Number"}</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="010xxxxxx"
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                      className="customInput"
                    />
                  </div>

                  <div className="customInputGroup">
                    <label className="inputLabel">
                      <span className="labelIcon">🏛️</span>
                      <span>{lang === "ar" ? "المحافظة" : "Governorate"}</span>
                    </label>
                    <select
                      value={checkoutGovernorate}
                      onChange={(e) => handleCheckoutGovChange(e.target.value)}
                      className="customInput customSelect"
                      required
                    >
                      <option value="">
                        {lang === "ar" ? "-- اختر المحافظة --" : "-- Select Governorate --"}
                      </option>
                      {checkoutGovList.map((gov) => {
                        const nameStr =
                          typeof gov.name === "string"
                            ? gov.name
                            : gov.name?.[lang] || gov.name?.ar || gov.name?.en || gov.id;
                        return (
                          <option key={gov.id} value={gov.id}>
                            {nameStr}
                          </option>
                        );
                      })}
                    </select>

                    {checkoutGovernorate && (
                      <div className="shippingFeeHint">
                        {organizationPolicy?.shipping?.freeShippingEnabled === true ||
                        currentShippingFee === 0
                          ? lang === "ar"
                            ? "✨ شحن مجاني لهذه المحافظة!"
                            : "✨ Free shipping for this governorate!"
                          : lang === "ar"
                          ? `🚚 رسوم الشحن للمحافظة المحددة: ${formatPrice(currentShippingFee, currency, lang)}`
                          : `🚚 Shipping fee for this governorate: ${formatPrice(currentShippingFee, currency, lang)}`}
                      </div>
                    )}
                  </div>

                  <div className="customInputGroup">
                    <label className="inputLabel">
                      <span className="labelIcon">🏙️</span>
                      <span>{lang === "ar" ? "المدينة / المركز" : "City / District"}</span>
                    </label>
                    <select
                      value={checkoutCity}
                      onChange={(e) => setCheckoutCity(e.target.value)}
                      className="customInput customSelect"
                      required
                      disabled={!checkoutGovernorate}
                    >
                      <option value="">
                        {lang === "ar" ? "-- اختر المدينة --" : "-- Select City --"}
                      </option>
                      {checkoutCityList.map((ct) => {
                        const nameStr =
                          typeof ct.name === "string"
                            ? ct.name
                            : ct.name?.[lang] || ct.name?.ar || ct.name?.en || ct.id;
                        return (
                          <option key={ct.id} value={ct.id}>
                            {nameStr}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="customInputGroup">
                    <label className="inputLabel">
                      <span className="labelIcon">🏡</span>
                      <span>{lang === "ar" ? "العنوان بالتفصيل" : "Detailed Address"}</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={
                        lang === "ar"
                          ? "اسم الشارع، رقم العمارة، الشقة، علامة مميزة"
                          : "Street, Building, Apartment, Landmark"
                      }
                      value={checkoutAddress}
                      onChange={(e) => setCheckoutAddress(e.target.value)}
                      className="customInput"
                    />
                  </div>
                </div>

                {/* Right Card: Order Items Summary & Billing Receipt */}
                <div className="checkoutSummaryCard">
                  <div className="checkoutSectionHeader">
                    <span>🧾</span>
                    <span>
                      {lang === "ar" ? "ملخص الطلب والفاتورة" : "Order & Invoice Summary"}
                    </span>
                  </div>

                  <div style={{ maxHeight: "170px", overflowY: "auto", paddingInlineEnd: "4px" }}>
                    {cart.map((item, idx) => {
                      const nameStr =
                        typeof item.product.name === "string"
                          ? item.product.name
                          : item.product.name?.[lang] || item.product.name?.ar || "";
                      return (
                        <div key={idx} className="summaryItemRow">
                          {item.product.imageUrl && (
                            <img src={item.product.imageUrl} alt="" className="summaryItemImg" />
                          )}
                          <div className="summaryItemMeta">
                            <span className="summaryItemTitle">{nameStr}</span>
                            {item.product.additionalData?.selectedVariants &&
                            Object.keys(item.product.additionalData.selectedVariants).length > 0 ? (
                              <span style={{ fontSize: "0.75rem", opacity: 0.75 }}>
                                {Object.entries(item.product.additionalData.selectedVariants)
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(" | ")}
                              </span>
                            ) : item.product.additionalData?.selectedColor ||
                              item.product.additionalData?.selectedSize ? (
                              <span style={{ fontSize: "0.75rem", opacity: 0.75 }}>
                                {[
                                  item.product.additionalData.selectedColor,
                                  item.product.additionalData.selectedSize,
                                ]
                                  .filter(Boolean)
                                  .join(" - ")}
                              </span>
                            ) : null}
                            <span className="summaryItemQty">
                              {lang === "ar"
                                ? `الكمية: ${item.quantity}`
                                : `Qty: ${item.quantity}`}
                            </span>
                          </div>
                          <span className="summaryItemPrice">
                            {formatPrice(item.product.price * item.quantity, currency, lang)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {slices.length > 0 && (
                    <div className="rewardsTierBanner">
                      <div className="rewardsTierBannerTitle">
                        <span>🎁</span>
                        <span>
                          {lang === "ar"
                            ? "عروض شرائح الخصم النشطة:"
                            : "Active Tier Discounts:"}
                        </span>
                      </div>
                      <ul style={{ margin: 0, paddingInlineStart: "1.2rem", lineHeight: 1.5 }}>
                        {slices.map((slice, idx) => (
                          <li key={idx}>
                            {lang === "ar"
                              ? `خصم ${formatPrice(slice.discountAmount, currency, lang)} عند الشراء بقيمة ${formatPrice(slice.minAmount, currency, lang)} أو أكثر`
                              : `Get ${formatPrice(slice.discountAmount, currency, lang)} OFF on orders of ${formatPrice(slice.minAmount, currency, lang)}+`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.55rem",
                      fontSize: "0.88rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ opacity: 0.85 }}>
                        {lang === "ar" ? "إجمالي المنتجات:" : "Products Total:"}
                      </span>
                      <strong style={{ whiteSpace: "nowrap" }}>
                        {formatPrice(subtotal, currency, lang)}
                      </strong>
                    </div>

                    {sliceDiscount > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          color: "var(--accent)",
                        }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <span>🎁</span>
                          <span>
                            {lang === "ar" ? "خصم الشريحة المستحق:" : "Slice Discount:"}
                          </span>
                        </span>
                        <strong style={{ whiteSpace: "nowrap" }}>
                          -{formatPrice(sliceDiscount, currency, lang)}
                        </strong>
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          opacity: 0.85,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span>🚚</span>
                        <span>
                          {lang === "ar" ? "رسوم الشحن للمحافظة:" : "Governorate Shipping:"}
                        </span>
                      </span>
                      <strong style={{ whiteSpace: "nowrap" }}>
                        {currentShippingFee > 0
                          ? formatPrice(currentShippingFee, currency, lang)
                          : lang === "ar"
                          ? "مجاني"
                          : "Free"}
                      </strong>
                    </div>

                    {enableVat && taxPercentage > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            opacity: 0.85,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span>🧾</span>
                          <span>
                            {lang === "ar"
                              ? `ضريبة القيمة المضافة (${taxPercentage}%):`
                              : `VAT (${taxPercentage}%):`}
                          </span>
                        </span>
                        <strong style={{ whiteSpace: "nowrap" }}>
                          {formatPrice(vatAmount, currency, lang)}
                        </strong>
                      </div>
                    )}

                    <div className="finalTotalCard">
                      <span className="finalTotalTitle">
                        {lang === "ar" ? "المبلغ الإجمالي النهائي:" : "Final Grand Total:"}
                      </span>
                      <span className="finalTotalAmount">
                        {formatPrice(currentGrandTotal, currency, lang)}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={checkoutLoading}
                      className="glowButton"
                      style={{
                        width: "100%",
                        justifyContent: "center",
                        marginTop: "0.75rem",
                        padding: "0.9rem",
                        fontSize: "1.02rem",
                      }}
                    >
                      {checkoutLoading ? (
                        <>
                          <span>⏳</span>
                          <span>
                            {lang === "ar"
                              ? "جاري تأكيد وإرسال الطلب..."
                              : "Placing your order..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <span>🔒</span>
                          <span>
                            {lang === "ar"
                              ? "تأكيد وإرسال الطلب الآن"
                              : "Confirm & Place Order Now"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
