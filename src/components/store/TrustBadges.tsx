"use client";

import { useApp } from "@/context/AppContext";
import { formatPrice } from "@/utils/currency";
import styles from "./StoreComponents.module.css";

export default function TrustBadges({ items }: { items?: any[] }) {
  const { lang, t, organizationPolicy } = useApp();

  let shippingDesc = t.trustShippingSub;
  if (organizationPolicy?.shipping) {
    const { freeShippingEnabled, defaultFee } = organizationPolicy.shipping;
    const currency = organizationPolicy.logistics?.currency;
    if (freeShippingEnabled) {
      shippingDesc = lang === "ar" ? "شحن مجاني على جميع الطلبات" : "Free shipping on all orders";
    } else if (typeof defaultFee === "number") {
      const formattedFee = formatPrice(defaultFee, currency, lang);
      shippingDesc = lang === "ar" 
        ? `شحن سريع بقيمة ${formattedFee}` 
        : `Fast shipping for only ${formattedFee}`;
    }
  }
  
  const displayItems = items && items.length > 0 ? items : [
    { icon: "🚚", title: t.trustShipping, description: shippingDesc },
    { icon: "🛡️", title: t.trustSecurity, description: t.trustSecuritySub },
    { icon: "🎧", title: t.trustSupport, description: t.trustSupportSub }
  ];

  return (
    <section className={`${styles.trustSection} animateFadeUp`}>
      <div className={styles.trustGrid}>
        {displayItems.map((item, index) => {
          const titleStr = typeof item.title === "string" 
            ? item.title 
            : item.title?.[lang] || item.title?.ar || "";
          const descStr = typeof item.description === "string" 
            ? item.description 
            : item.description?.[lang] || item.description?.ar || "";
          return (
            <div key={index} className={`${styles.trustCard} glassCard`}>
              <span className={styles.trustIcon}>{item.icon || "✓"}</span>
              <div>
                <h4>{titleStr}</h4>
                <p>{descStr}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
