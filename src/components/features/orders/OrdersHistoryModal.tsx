"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";
import { formatPrice } from "@/utils/currency";
import styles from "@/components/Navbar/Navbar.module.css";

interface OrdersHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrdersHistoryModal({ isOpen, onClose }: OrdersHistoryModalProps) {
  const { lang, authToken, organizationPolicy } = useApp();

  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (isOpen && authToken) {
      setOrdersLoading(true);
      api
        .getPublicOrders(authToken)
        .then((res) => setOrdersList(res))
        .catch((err) => console.error("Error loading orders:", err))
        .finally(() => setOrdersLoading(false));
    }
  }, [isOpen, authToken]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.loginModal} ${lang === "ar" ? styles.rtl : styles.ltr}`}
        style={{ maxWidth: "700px", width: "95%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className={styles.modalCloseBtn}>
          ✕
        </button>
        <h3>{lang === "ar" ? "طلباتي" : "My Orders"}</h3>

        <div style={{ marginTop: "1rem", maxHeight: "400px", overflowY: "auto" }}>
          {ordersLoading ? (
            <p style={{ textAlign: "center", padding: "2rem" }}>
              {lang === "ar" ? "جاري تحميل الطلبات..." : "Loading orders..."}
            </p>
          ) : ordersList.length === 0 ? (
            <p style={{ textAlign: "center", padding: "2rem", opacity: 0.7 }}>
              {lang === "ar" ? "ليس لديك أي طلبات سابقة." : "You do not have any past orders."}
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {ordersList.map((order) => {
                const statusName = order.workflow?.stepInfo?.name
                  ? typeof order.workflow.stepInfo.name === "string"
                    ? order.workflow.stepInfo.name
                    : order.workflow.stepInfo.name[lang] || order.workflow.stepInfo.name.ar
                  : lang === "ar"
                  ? "قيد المراجعة"
                  : "Under Review";

                const dateStr = new Date(order.createdAt).toLocaleDateString(
                  lang === "ar" ? "ar-EG" : "en-US",
                  { year: "numeric", month: "short", day: "numeric" }
                );

                return (
                  <div
                    key={order.id}
                    className="glassCard"
                    style={{
                      padding: "1rem",
                      borderRadius: "var(--radius-sm, 6px)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span style={{ fontWeight: "bold" }}>#{order.id.slice(-6).toUpperCase()}</span>
                      <span
                        style={{
                          background: "var(--primary)",
                          color: "#fff",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.78rem",
                        }}
                      >
                        {statusName}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.85rem",
                        opacity: 0.8,
                      }}
                    >
                      <span>{dateStr}</span>
                      <strong>
                        {formatPrice(order.totalOrderPrice, organizationPolicy?.logistics?.currency, lang)}
                      </strong>
                    </div>

                    {/* Order Items Summary */}
                    <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", opacity: 0.7 }}>
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx}>
                          • {item.name} (x{item.quantity})
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
