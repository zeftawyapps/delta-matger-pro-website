"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { formatPrice } from "@/utils/currency";
import { getSectionHeaderTexts, resolveLocalizedText } from "@/utils/sectionHelpers";
import SectionHeader from "@/components/common/SectionHeader";
import styles from "./StoreComponents.module.css";

interface TrustBadgesProps {
  items?: any[];
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  config?: any;
}

export default function TrustBadges({ items, title, description, config }: TrustBadgesProps) {
  const { lang, t, organizationPolicy } = useApp();
  const { titleText, descText, hasHeader } = getSectionHeaderTexts({ title, description }, lang);

  let shippingDesc = t.trustShippingSub;
  if (organizationPolicy?.shipping) {
    const { freeShippingEnabled, defaultFee } = organizationPolicy.shipping;
    const currency = organizationPolicy.logistics?.currency;
    if (freeShippingEnabled) {
      shippingDesc = lang === "ar" ? "شحن مجاني على جميع الطلبات" : "Free shipping on all orders";
    } else if (typeof defaultFee === "number") {
      const formattedFee = formatPrice(defaultFee, currency, lang);
      shippingDesc =
        lang === "ar"
          ? `شحن سريع بقيمة ${formattedFee}`
          : `Fast shipping for only ${formattedFee}`;
    }
  }

  const displayItems =
    items && items.length > 0
      ? items
      : [
          { icon: "🚚", title: t.trustShipping, description: shippingDesc },
          { icon: "🛡️", title: t.trustSecurity, description: t.trustSecuritySub },
          { icon: "🎧", title: t.trustSupport, description: t.trustSupportSub },
        ];

  return (
    <section className={`${styles.trustSection} animateFadeUp`}>
      <SectionHeader
        title={titleText}
        subtitle={descText}
        config={config}
      />
      <div className={styles.trustGrid}>
        {displayItems.map((item, index) => {
          const titleStr = resolveLocalizedText(item.title, lang);
          const descStr = resolveLocalizedText(item.description || item.desc, lang);
          return (
            <div key={index} className={`${styles.trustCard} glassCard attractiveCard`}>
              <span className={styles.trustIcon}>{item.icon || "✓"}</span>
              <div>
                {titleStr && <h4>{titleStr}</h4>}
                {descStr && <p>{descStr}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
