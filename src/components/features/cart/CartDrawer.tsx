"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useCartSummary } from "@/hooks/useCartSummary";
import { getCartLineKey } from "@/utils/productPriceOptions";
import { formatPrice } from "@/utils/currency";
import styles from "@/components/Navbar/Navbar.module.css";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
  onRequireLogin: () => void;
}

function parseColorHex(valueStr: string): string {
  if (!valueStr) return "#888888";
  const hexMatch = valueStr.match(/#([0-9a-fA-F]{3,8})/);
  if (hexMatch) return hexMatch[0];
  const lower = valueStr.toLowerCase().trim();
  if (lower.includes("أحمر") || lower.includes("red")) return "#e53935";
  if (lower.includes("أزرق") || lower.includes("blue")) return "#1e88e5";
  if (lower.includes("كحلي") || lower.includes("navy")) return "#0d47a1";
  if (lower.includes("أخضر") || lower.includes("green")) return "#43a047";
  if (lower.includes("أصفر") || lower.includes("yellow")) return "#fdd835";
  if (lower.includes("رمادي") || lower.includes("grey") || lower.includes("gray")) return "#757575";
  if (lower.includes("أسود") || lower.includes("black")) return "#212121";
  if (lower.includes("أبيض") || lower.includes("white")) return "#ffffff";
  if (lower.includes("وردي") || lower.includes("pink")) return "#e91e63";
  if (lower.includes("برتقالي") || lower.includes("orange")) return "#ff9800";
  if (lower.includes("بني") || lower.includes("brown")) return "#795548";
  if (lower.includes("بيج") || lower.includes("beige")) return "#f5f5dc";
  if (lower.includes("بنفسجي") || lower.includes("purple")) return "#9c27b0";
  return "#757575";
}

function isColorVariantGroup(name: string): boolean {
  const norm = name.toLowerCase();
  return (
    norm.includes("لون") ||
    norm.includes("الوان") ||
    norm.includes("ألوان") ||
    norm.includes("color") ||
    norm.includes("colour")
  );
}

export default function CartDrawer({
  isOpen,
  onClose,
  onProceedToCheckout,
  onRequireLogin,
}: CartDrawerProps) {
  const {
    lang,
    t,
    appMode,
    cart,
    removeFromCart,
    updateCartQuantity,
    currentUser,
  } = useApp();

  const {
    cartCount,
    subtotal,
    sliceDiscount,
    shippingFee,
    enableVat,
    taxPercentage,
    vatAmount,
    finalTotal,
    currency,
  } = useCartSummary();

  const pathname = usePathname();
  const router = useRouter();

  if (!isOpen || appMode === "blog") return null;

  return (
    <div className={styles.cartOverlay} onClick={onClose}>
      <div
        className={`${styles.cartDrawer} ${lang === "ar" ? styles.rtl : styles.ltr}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.cartHeader}>
          <h3>
            <span>🛍️</span>
            <span>{t.cart}</span>
            <span className={styles.cartCountBadge}>{cartCount}</span>
          </h3>
          <button
            onClick={onClose}
            className={styles.closeBtn}
            aria-label={lang === "ar" ? "إغلاق السلة" : "Close Cart"}
          >
            ✕
          </button>
        </div>

        <div className={styles.cartItems}>
          {cart.length === 0 ? (
            <div className={styles.emptyCart}>
              <div className={styles.emptyCartIcon}>🛒</div>
              <h4 style={{ margin: 0, fontWeight: 700 }}>{t.cartEmpty}</h4>
              <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.7 }}>
                {lang === "ar"
                  ? "لم تقم بإضافة أي منتجات إلى سلتك بعد."
                  : "You haven't added any products to your cart yet."}
              </p>
              <button
                onClick={() => {
                  onClose();
                  if (pathname !== "/store") router.push("/store");
                }}
                className="glowButton"
                style={{ marginTop: "0.5rem", padding: "0.5rem 1.25rem", fontSize: "0.9rem" }}
              >
                {lang === "ar" ? "تصفح المنتجات ➔" : "Browse Products ➔"}
              </button>
            </div>
          ) : (
            cart.map((item, index) => {
              const itemKey = getCartLineKey(item.product);
              const nameStr =
                typeof item.product.name === "string"
                  ? item.product.name
                  : item.product.name?.[lang] || item.product.name?.ar || "";

              return (
                <div key={`${itemKey}-${index}`} className={styles.cartItem}>
                  {item.product.imageUrl && (
                    <img src={item.product.imageUrl} alt={nameStr} className={styles.cartItemImg} />
                  )}
                  <div className={styles.cartItemInfo}>
                    <h4>{nameStr}</h4>

                    {/* Selected Specs Chips */}
                    <div className={styles.cartItemSpecsList}>
                      {item.product.additionalData?.selectedVariants &&
                      Object.keys(item.product.additionalData.selectedVariants).length > 0 ? (
                        Object.entries(item.product.additionalData.selectedVariants).map(
                          ([gName, val]) => (
                            <span key={gName} className={styles.cartSpecChip}>
                              <span style={{ opacity: 0.7 }}>{gName}:</span>
                              {isColorVariantGroup(gName) && (
                                <span
                                  style={{
                                    display: "inline-block",
                                    width: "10px",
                                    height: "10px",
                                    borderRadius: "50%",
                                    backgroundColor: parseColorHex(val),
                                    border: "1px solid var(--border)",
                                  }}
                                />
                              )}
                              <span>{val}</span>
                            </span>
                          )
                        )
                      ) : (
                        <>
                          {item.product.additionalData?.selectedPriceOptionKey && (
                            <span className={styles.cartSpecChip}>
                              <span style={{ opacity: 0.7 }}>
                                {lang === "ar" ? "الخيار: " : "Option: "}
                              </span>
                              <span>{item.product.additionalData.selectedPriceOptionKey}</span>
                            </span>
                          )}

                          {item.product.additionalData?.selectedColor && (
                            <span className={styles.cartSpecChip}>
                              <span style={{ opacity: 0.7 }}>
                                {lang === "ar" ? "اللون: " : "Color: "}
                              </span>
                              <span
                                style={{
                                  display: "inline-block",
                                  width: "10px",
                                  height: "10px",
                                  borderRadius: "50%",
                                  backgroundColor: parseColorHex(
                                    item.product.additionalData.selectedColor
                                  ),
                                  border: "1px solid var(--border)",
                                }}
                              />
                              <span>{item.product.additionalData.selectedColor}</span>
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Stepper and Price Row */}
                    <div className={styles.cartItemPriceRow}>
                      <div className="cartStepper">
                        <button
                          type="button"
                          className="cartStepperBtn"
                          onClick={() => updateCartQuantity(itemKey, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="cartStepperCount">{item.quantity}</span>
                        <button
                          type="button"
                          className="cartStepperBtn"
                          onClick={() => updateCartQuantity(itemKey, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                        <span className={styles.cartItemPriceTotal}>
                          {formatPrice(item.product.price * item.quantity, currency, lang)}
                        </span>
                        {item.quantity > 1 && (
                          <span className={styles.cartItemPriceSingle}>
                            ({formatPrice(item.product.price, currency, lang)} /{" "}
                            {lang === "ar" ? "قطعة" : "pc"})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(itemKey)}
                    className={styles.cartItemRemove}
                    title={t.removeFromCart}
                    aria-label={t.removeFromCart}
                  >
                    🗑
                  </button>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className={styles.cartFooter}>
            {/* Breakdown Rows */}
            <div className={styles.cartSummaryRows}>
              <div className={styles.cartSummaryRow}>
                <span className={styles.cartSummaryRowLabel}>
                  <span>🧾</span>
                  <span>{lang === "ar" ? "إجمالي المنتجات:" : "Subtotal:"}</span>
                </span>
                <span className={styles.cartSummaryRowValue}>
                  {formatPrice(subtotal, currency, lang)}
                </span>
              </div>

              {sliceDiscount > 0 && (
                <div className={styles.cartSummaryRow} style={{ color: "var(--accent)" }}>
                  <span className={styles.cartSummaryRowLabel}>
                    <span>🎁</span>
                    <span>{lang === "ar" ? "خصم الشريحة المستحق:" : "Slice Discount:"}</span>
                  </span>
                  <span className={styles.cartSummaryRowValue}>
                    -{formatPrice(sliceDiscount, currency, lang)}
                  </span>
                </div>
              )}

              <div className={styles.cartSummaryRow}>
                <span className={styles.cartSummaryRowLabel}>
                  <span>🚚</span>
                  <span>{lang === "ar" ? "الشحن التقديري:" : "Estimated Shipping:"}</span>
                </span>
                <span className={styles.cartSummaryRowValue}>
                  {shippingFee > 0
                    ? formatPrice(shippingFee, currency, lang)
                    : lang === "ar"
                    ? "شحن مجاني"
                    : "Free Shipping"}
                </span>
              </div>

              {enableVat && taxPercentage > 0 && (
                <div className={styles.cartSummaryRow}>
                  <span className={styles.cartSummaryRowLabel}>
                    <span>📊</span>
                    <span>
                      {lang === "ar"
                        ? `ضريبة القيمة المضافة (${taxPercentage}%):`
                        : `VAT (${taxPercentage}%):`}
                    </span>
                  </span>
                  <span className={styles.cartSummaryRowValue}>
                    {formatPrice(vatAmount, currency, lang)}
                  </span>
                </div>
              )}
            </div>

            <div style={{ height: "1px", background: "var(--border)", margin: "0.85rem 0" }} />

            <div className={styles.cartTotalRow}>
              <span>{t.total}:</span>
              <strong className={styles.cartTotalAmount}>
                {formatPrice(finalTotal, currency, lang)}
              </strong>
            </div>

            <button
              onClick={() => {
                if (!currentUser) {
                  alert(
                    lang === "ar"
                      ? "يجب تسجيل الدخول أولاً لإتمام الطلب"
                      : "Please log in first to complete the order"
                  );
                  onRequireLogin();
                } else {
                  onProceedToCheckout();
                }
              }}
              className="glowButton"
              style={{
                width: "100%",
                justifyContent: "center",
                marginTop: "0.85rem",
                padding: "0.9rem",
                fontSize: "1.02rem",
              }}
            >
              <span>🛒</span>
              <span>{lang === "ar" ? "متابعة تأكيد الطلب ➔" : "Proceed to Checkout ➔"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
