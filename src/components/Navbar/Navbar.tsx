"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { getCartLineKey } from "@/utils/productPriceOptions";
import FeedbackModal from "../FeedbackModal/FeedbackModal";
import { formatPrice } from "@/utils/currency";
import { api, BASE_URL } from "@/services/api";
import clientConfig from "@/config/clientConfig.json";
import { clearCampaignAttribution } from "@/utils/campaignTracker";
import styles from "./Navbar.module.css";

function parseColorHex(valueStr: string): string {
  if (!valueStr) return '#888888';
  const hexMatch = valueStr.match(/#([0-9a-fA-F]{3,8})/);
  if (hexMatch) return hexMatch[0];
  const lower = valueStr.toLowerCase().trim();
  if (lower.includes('أحمر') || lower.includes('red')) return '#e53935';
  if (lower.includes('أزرق') || lower.includes('blue')) return '#1e88e5';
  if (lower.includes('كحلي') || lower.includes('navy')) return '#0d47a1';
  if (lower.includes('أخضر') || lower.includes('green')) return '#43a047';
  if (lower.includes('أصفر') || lower.includes('yellow')) return '#fdd835';
  if (lower.includes('رمادي') || lower.includes('grey') || lower.includes('gray')) return '#757575';
  if (lower.includes('أسود') || lower.includes('black')) return '#212121';
  if (lower.includes('أبيض') || lower.includes('white')) return '#ffffff';
  if (lower.includes('وردي') || lower.includes('pink')) return '#e91e63';
  if (lower.includes('برتقالي') || lower.includes('orange')) return '#ff9800';
  if (lower.includes('بني') || lower.includes('brown')) return '#795548';
  if (lower.includes('بيج') || lower.includes('beige')) return '#f5f5dc';
  if (lower.includes('بنفسجي') || lower.includes('purple')) return '#9c27b0';
  return '#757575';
}

function isColorVariantGroup(name: string): boolean {
  const norm = name.toLowerCase();
  return norm.includes('لون') || norm.includes('الوان') || norm.includes('ألوان') || norm.includes('color') || norm.includes('colour');
}

export default function Navbar() {
  const {
    config,
    theme,
    toggleTheme,
    lang,
    changeLanguage,
    appMode,
    setAppMode,
    searchQuery,
    setSearchQuery,
    cart,
    removeFromCart,
    updateCartQuantity,
    currentUser,
    loginWithCredentials,
    loginWithPhone,
    signupWithPhone,
    logout,
    navPages,
    t,
    appTitle,
    categories,
    productCategories,
    profile,
    organizationPolicy,
    clearCart,
    authToken,
    updateProfile,
  } = useApp();

  const pathname = usePathname();
  const router = useRouter();

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim() !== "" && pathname !== "/" && pathname !== "/store" && pathname !== "/blog" && pathname !== "/hybrid") {
      router.push("/");
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Checkout form states
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string>("");
  const [orderSuccessData, setOrderSuccessData] = useState<any | null>(null);
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutGovernorate, setCheckoutGovernorate] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [checkoutGovList, setCheckoutGovList] = useState<any[]>([]);
  const [checkoutCity, setCheckoutCity] = useState("");
  const [checkoutCityList, setCheckoutCityList] = useState<any[]>([]);

  // Orders list states
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Profile settings states
  const [countries, setCountries] = useState<any[]>([]);
  const [governorates, setGovernorates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [settingsName, setSettingsName] = useState("");
  const [settingsPhone, setSettingsPhone] = useState("");
  const [settingsAddress, setSettingsAddress] = useState("");
  const [settingsCountryId, setSettingsCountryId] = useState("");
  const [settingsGovId, setSettingsGovId] = useState("");
  const [settingsCityId, setSettingsCityId] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Sync checkout fields when opening checkout modal
  useEffect(() => {
    if (checkoutOpen) {
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

      // Load governorates for checkout dropdown (EG default) & cities sequentially
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
  }, [checkoutOpen, profile, currentUser]);

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

  // Load orders list when orders modal opens
  useEffect(() => {
    if (ordersOpen && authToken) {
      setOrdersLoading(true);
      api.getPublicOrders(authToken)
        .then((res) => setOrdersList(res))
        .catch((err) => console.error("Error loading orders:", err))
        .finally(() => setOrdersLoading(false));
    }
  }, [ordersOpen, authToken]);

  // Load countries and pre-fill profile inside Settings modal
  useEffect(() => {
    if (settingsOpen) {
      setSettingsLoading(true);

      const initName = currentUser?.name || profile?.name || profile?.username || "";
      const initPhone = profile?.phone || currentUser?.phone || "";
      const initAddress = profile?.address || "";
      const initCountryId = profile?.countryId || "EG";
      const initGovId = profile?.governorateId || "";
      const initCityId = profile?.cityId || "";

      setSettingsName(initName);
      setSettingsPhone(initPhone);
      setSettingsAddress(initAddress);
      setSettingsCountryId(initCountryId);
      setSettingsGovId(initGovId);
      setSettingsCityId(initCityId);

      (async () => {
        try {
          let countriesData = await api.getCountries().catch(() => []);
          if (countriesData.length === 0) {
            // Self-seed if database is empty
            await fetch(`${BASE_URL}/locations/governorates/seed`, { method: "POST" }).catch(() => null);
            countriesData = await api.getCountries().catch(() => []);
          }
          setCountries(countriesData);

          if (initCountryId) {
            const govs = await api.getGovernorates(initCountryId).catch(() => []);
            setGovernorates(govs);

            if (initGovId) {
              const cts = await api.getCities(initGovId).catch(() => []);
              setCities(cts);
            }
          }
        } catch (err) {
          console.error("Error loading profile locations:", err);
        } finally {
          setSettingsLoading(false);
        }
      })();
    }
  }, [settingsOpen, profile, currentUser]);

  const handleSettingsCountryChange = async (newCountryId: string) => {
    setSettingsCountryId(newCountryId);
    setSettingsGovId("");
    setSettingsCityId("");
    setGovernorates([]);
    setCities([]);
    if (newCountryId) {
      try {
        const govs = await api.getGovernorates(newCountryId);
        setGovernorates(govs);
      } catch (err) {
        console.error("Error loading governorates:", err);
      }
    }
  };

  const handleSettingsGovChange = async (newGovId: string) => {
    setSettingsGovId(newGovId);
    setSettingsCityId("");
    setCities([]);
    if (newGovId) {
      try {
        const cts = await api.getCities(newGovId);
        setCities(cts);
      } catch (err) {
        console.error("Error loading cities:", err);
      }
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;

    setSettingsLoading(true);
    try {
      await updateProfile({
        name: settingsName,
        username: profile?.username || settingsName,
        phone: settingsPhone,
        address: settingsAddress,
        countryId: settingsCountryId,
        governorateId: settingsGovId,
        cityId: settingsCityId,
      });

      alert(lang === "ar" ? "تم تحديث الملف الشخصي بنجاح!" : "Profile updated successfully!");
      setSettingsOpen(false);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      alert(lang === "ar" 
        ? `فشل الحفظ: ${err.message || "خطأ غير معروف"}` 
        : `Save failed: ${err.message || "Unknown error"}`
      );
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError("");
    if (!authToken || !currentUser) {
      alert(lang === "ar" ? "يرجى تسجيل الدخول أولاً." : "Please log in first.");
      setLoginOpen(true);
      setCheckoutOpen(false);
      return;
    }

    setCheckoutLoading(true);
    try {
      // 1. Recalculate shipping fee for the selected governorate
      let finalShippingFee = 0;
      if (organizationPolicy?.shipping) {
        const isFree = organizationPolicy.shipping.freeShippingEnabled === true;
        if (!isFree) {
          finalShippingFee = organizationPolicy.shipping.defaultFee || 0;
          if (checkoutGovernorate && organizationPolicy.shipping.feesByGovernorate) {
            const govFee = organizationPolicy.shipping.feesByGovernorate[checkoutGovernorate];
            if (typeof govFee === "number") finalShippingFee = govFee;
          }
        }
      }

      // 2. Map items to OrderItemData[]
      const orderItems = cart.map((item) => {
        const baseName = typeof item.product.name === "string" 
          ? item.product.name 
          : item.product.name?.[lang] || item.product.name?.ar || "";
        
        const variantParts: string[] = [];
        if (item.product.additionalData?.selectedVariants) {
          Object.entries(item.product.additionalData.selectedVariants).forEach(([k, v]) => {
            variantParts.push(`${k}: ${v}`);
          });
        } else {
          if (item.product.additionalData?.selectedColor) {
            variantParts.push(`${lang === 'ar' ? 'اللون' : 'Color'}: ${item.product.additionalData.selectedColor}`);
          }
          if (item.product.additionalData?.selectedPriceOptionKey || item.product.additionalData?.selectedSize) {
            variantParts.push(`${lang === 'ar' ? 'المقاس' : 'Size'}: ${item.product.additionalData.selectedPriceOptionKey || item.product.additionalData.selectedSize}`);
          }
        }

        return {
          id: item.product.id,
          name: baseName,
          description: variantParts.length > 0 ? variantParts.join(' | ') : undefined,
          quantity: item.quantity,
          unitPrice: item.product.price,
          totalPrice: item.product.price * item.quantity,
        };
      });

      // 3. Compute final order price
      const orderTotal = Math.max(0, subtotal - sliceDiscount + finalShippingFee + vatAmount);

      // 4. Submit order via API
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
      const workflowSlug = orderSettings.workflowSlug !== undefined ? orderSettings.workflowSlug : null;
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
        orderId: (createdOrder as any)?.id || (createdOrder as any)?._id || `ORD-${Date.now().toString().slice(-6)}`,
        total: orderTotal,
        itemsCount: orderItems.reduce((sum, item) => sum + item.quantity, 0),
        recipientName: checkoutName,
        recipientPhone: checkoutPhone,
      });
    } catch (err: any) {
      console.error("Order submission failed:", err);
      const errMsg = err.message || (lang === "ar" ? "تعذر إرسال الطلب، يرجى المحاولة مرة أخرى." : "Could not place order, please try again.");
      setCheckoutError(errMsg);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Auth form states: "login" (phone only), "signup" (name + phone)
  const [loginMethod, setLoginMethod] = useState<"login" | "signup">("login");
  const [phoneInput, setPhoneInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll to add glass shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate cart count & total breakdown
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  // 1. Slice/Tier Discount (خصم الشرائح)
  let sliceDiscount = 0;
  const slices = organizationPolicy?.salesRules?.invoiceSlices || [];
  if (slices.length > 0) {
    const applicableSlices = slices.filter((s) => subtotal >= s.minAmount);
    if (applicableSlices.length > 0) {
      const bestSlice = applicableSlices.reduce((prev, curr) => (curr.minAmount > prev.minAmount ? curr : prev), applicableSlices[0]);
      sliceDiscount = bestSlice.discountAmount;
    }
  }

  // 2. Shipping Fee
  let shippingFee = 0;
  if (organizationPolicy?.shipping) {
    const isFree = organizationPolicy.shipping.freeShippingEnabled === true;
    if (!isFree) {
      shippingFee = organizationPolicy.shipping.defaultFee || 0;
      const userGov = profile?.governorateId;
      if (userGov && organizationPolicy.shipping.feesByGovernorate) {
        const govFee = organizationPolicy.shipping.feesByGovernorate[userGov]
          || organizationPolicy.shipping.feesByGovernorate[userGov.replace("eg_", "")];
        if (typeof govFee === "number") {
          shippingFee = govFee;
        }
      }
    }
  }

  // 3. Value Added Tax (VAT)
  let vatAmount = 0;
  const enableVat = organizationPolicy?.logistics?.enableVat === true;
  const taxPercentage = organizationPolicy?.logistics?.taxPercentage || 0;
  if (enableVat && taxPercentage > 0) {
    const taxableAmount = Math.max(0, subtotal - sliceDiscount);
    vatAmount = taxableAmount * (taxPercentage / 100);
  }

  // 4. Final Total
  const finalTotal = Math.max(0, subtotal - sliceDiscount + shippingFee + vatAmount);

  // Close menus on page change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCartOpen(false);
    setSettingsOpen(false);
    setSidebarOpen(false);
    setToolsOpen(false);
  }, [pathname]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      if (loginMethod === "login") {
        if (phoneInput.trim().length < 6) {
          throw new Error(lang === "ar" ? "رقم الهاتف غير صالح" : "Invalid phone number");
        }
        await loginWithPhone(phoneInput);
      } else {
        if (!nameInput.trim()) {
          throw new Error(lang === "ar" ? "يرجى إدخال الاسم بالكامل" : "Please enter your full name");
        }
        if (phoneInput.trim().length < 6) {
          throw new Error(lang === "ar" ? "رقم الهاتف غير صالح" : "Invalid phone number");
        }
        await signupWithPhone(nameInput.trim(), phoneInput.trim());
      }
      setLoginOpen(false);
      setNameInput("");
      setPhoneInput("");
    } catch (err: any) {
      setAuthError(err.message || t.loginError);
    }
  };

  const excessMode = config?.website?.excessLinksMode ?? 'dropdown';
  const linksStyle = config?.website?.navbarLinksStyle ?? 'classic';
  const navbarLayout = config?.website?.navbarLayout ?? 'classic';
  const navbarTheme = config?.website?.navbarTheme ?? 'glass';
  // navbarSticky: true = fixed to top (default), false = scrolls with page
  const navbarSticky = config?.website?.navbarSticky ?? true;

  const customNavbarBg = config?.website?.customNavbarBg || config?.website?.navbarBg;
  const customNavbarTextColor = config?.website?.customNavbarTextColor || config?.website?.navbarTextColor;

  // Logo styling driven by config.website.logoStyle ("solid" | "gradient") or custom text color
  const logoStyle = config?.website?.logoStyle ?? "solid";
  const logoTextStyle: React.CSSProperties =
    customNavbarTextColor
      ? { color: customNavbarTextColor, WebkitTextFillColor: customNavbarTextColor }
      : logoStyle === "gradient"
      ? {
        background: "linear-gradient(135deg, var(--primary), var(--secondary))",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }
      : { color: "var(--primary)" };

  // Order of the top-level navbar blocks, driven by config.website.navbarOrder
  const navbarOrder: string[] =
    config?.website?.navbarOrder ?? ["logo", "nav", "search", "tools"];

  const logoBlock = (
    <Link href="/" className={styles.logo}>
      {config?.visual?.logoUrl ? (
        <img
          src={config.visual.logoUrl}
          alt={appTitle}
          className={styles.logoImage}
        />
      ) : (
        <span className={styles.logoIcon}>◆</span>
      )}
      <span className={styles.logoText} style={logoTextStyle}>
        {appTitle}
      </span>
    </Link>
  );

  const searchBlock =
    appMode !== "blog" ? (
      <div className={styles.searchWrapper}>
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className={styles.searchInput}
          style={customNavbarTextColor ? { color: customNavbarTextColor, borderColor: customNavbarTextColor } : undefined}
        />
        <span className={styles.searchIcon}>🔍</span>
      </div>
    ) : null;

  const EXCESS_THRESHOLD = 3;
  const visiblePages = navPages.slice(0, EXCESS_THRESHOLD);
  const excessPages = navPages.slice(EXCESS_THRESHOLD);

  const headerInlineStyle: React.CSSProperties = {
    ...(customNavbarBg ? { backgroundColor: customNavbarBg, backgroundImage: "none" } : {}),
    ...(customNavbarTextColor ? { color: customNavbarTextColor, "--fg": customNavbarTextColor } as any : {}),
  };

  const linkCustomStyle: React.CSSProperties = customNavbarTextColor ? { color: customNavbarTextColor } : {};
  const dropdownMenuStyle: React.CSSProperties = customNavbarBg ? { backgroundColor: customNavbarBg } : {};

  const navBlock = (
    <nav className={`${styles.desktopNav} ${styles[`style_${linksStyle}`]}`}>
      <Link href="/" className={`${styles.navLink} ${pathname === "/" ? styles.active : ""}`} style={linkCustomStyle}>
        {t.home}
      </Link>

      {/* 1. Hybrid Mode: Show Home, Blog dropdown, and Store dropdown. No Hybrid page link! */}
      {appMode === "hybrid" && (
        <>
          <div className={styles.dropdownContainer}>
            <Link href="/blog" className={`${styles.navLink} ${pathname.startsWith("/blog") ? styles.active : ""}`} style={linkCustomStyle}>
              {t.blog} {config?.website?.showBlogCategoriesInNavbar && categories.length > 0 && "▾"}
            </Link>
            {config?.website?.showBlogCategoriesInNavbar && categories.length > 0 && (
              <div className={styles.dropdownMenu} style={dropdownMenuStyle}>
                {categories.map((cat) => {
                  const nameStr = typeof cat.name === "string" ? cat.name : cat.name?.[lang] || cat.name?.ar || "";
                  return (
                    <Link key={cat.id} href={`/blog?category=${cat.id}`} className={styles.dropdownItem} style={linkCustomStyle}>
                      {nameStr}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.dropdownContainer}>
            <Link href="/store" className={`${styles.navLink} ${pathname.startsWith("/store") ? styles.active : ""}`} style={linkCustomStyle}>
              {t.store} {config?.website?.showStoreCategoriesInNavbar && productCategories.length > 0 && "▾"}
            </Link>
            {config?.website?.showStoreCategoriesInNavbar && productCategories.length > 0 && (
              <div className={styles.dropdownMenu} style={dropdownMenuStyle}>
                {productCategories.map((cat) => {
                  const nameStr = typeof cat.name === "string" ? cat.name : cat.name?.[lang] || cat.name?.ar || "";
                  return (
                    <Link key={cat.id} href={`/store?category=${cat.id}`} className={styles.dropdownItem} style={linkCustomStyle}>
                      {nameStr}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* 2. Store-only Mode: Show Home, 'Our Products' link, and 'Categories' dropdown. No Blog! */}
      {appMode === "store" && (
        <>
          <Link href="/store" className={`${styles.navLink} ${pathname === "/store" ? styles.active : ""}`} style={linkCustomStyle}>
            {lang === "ar" ? "منتجاتنا" : "Our Products"}
          </Link>

          <div className={styles.dropdownContainer}>
            <span className={`${styles.navLink} ${pathname.includes("category") ? styles.active : ""}`} style={{ cursor: "pointer", ...linkCustomStyle }}>
              {lang === "ar" ? "الأصناف" : "Categories"} {productCategories.length > 0 && "▾"}
            </span>
            {productCategories.length > 0 && (
              <div className={styles.dropdownMenu} style={dropdownMenuStyle}>
                {productCategories.map((cat) => {
                  const nameStr = typeof cat.name === "string" ? cat.name : cat.name?.[lang] || cat.name?.ar || "";
                  return (
                    <Link key={cat.id} href={`/store?category=${cat.id}`} className={styles.dropdownItem} style={linkCustomStyle}>
                      {nameStr}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* 3. Blog-only Mode: Show Home, and a 'Blog Categories' sidebar toggle. No Store! */}
      {appMode === "blog" && (
        <span
          onClick={() => setSidebarOpen(true)}
          className={styles.navLink}
          style={{ cursor: "pointer", ...linkCustomStyle }}
          role="button"
        >
          {lang === "ar" ? "أقسام المدونة ☰" : "Blog Categories ☰"}
        </span>
      )}

      {visiblePages.map((page) => {
        const title = typeof page.title === "string" ? page.title : page.title?.[lang] || page.title?.ar || "";
        return (
          <Link
            key={page.id}
            href={`/${page.slug}`}
            className={`${styles.navLink} ${pathname === `/${page.slug}` ? styles.active : ""}`}
            style={linkCustomStyle}
          >
            {title}
          </Link>
        );
      })}

      {excessPages.length > 0 && excessMode === 'dropdown' && (
        <div className={styles.dropdownContainer}>
          <button className={`${styles.navLink} ${styles.dropdownToggle}`} style={{ background: "transparent", border: "none", cursor: "pointer", font: "inherit", padding: 0, ...linkCustomStyle }}>
            {lang === "ar" ? "المزيد ▾" : "More ▾"}
          </button>
          <div className={styles.dropdownMenu} style={dropdownMenuStyle}>
            {excessPages.map((page) => {
              const title = typeof page.title === "string" ? page.title : page.title?.[lang] || page.title?.ar || "";
              return (
                <Link
                  key={page.id}
                  href={`/${page.slug}`}
                  className={styles.dropdownItem}
                  style={linkCustomStyle}
                >
                  {title}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {excessPages.length > 0 && excessMode === 'sidebar' && (
        <span
          onClick={() => setSidebarOpen(true)}
          className={`${styles.navLink} ${styles.sidebarToggle}`}
          style={{ cursor: "pointer" }}
          role="button"
        >
          {lang === "ar" ? "المزيد ☰" : "More ☰"}
        </span>
      )}

    </nav>
  );

  const toolsBlock = (
    <div className={styles.actions}>
      {/* Combined Tools/Settings Dropdown */}
      <div className={styles.toolsDropdownContainer}>
        <button
          onClick={() => setToolsOpen(!toolsOpen)}
          className={styles.actionButton}
          title={t.settings}
          aria-label="Toggle Settings Menu"
        >
          ⚙️
        </button>
        {toolsOpen && (
          <div className={`${styles.toolsDropdown} glassCard`}>
            {/* User Account Section */}
            <div className={styles.dropdownSection}>
              {currentUser ? (
                <div className={styles.userDropdownMenu} style={{ gap: "0.4rem" }}>
                  <span className={styles.dropdownUserWelcome}>
                    👤 {currentUser.name || currentUser.username}
                  </span>
                  <button
                    onClick={() => {
                      setSettingsOpen(true);
                      setToolsOpen(false);
                    }}
                    className={styles.dropdownLogoutButton}
                    style={{ background: "var(--primary)", color: "#fff", border: "none" }}
                  >
                    ⚙️ {lang === "ar" ? "الملف الشخصي" : "My Profile"}
                  </button>
                  <button
                    onClick={() => {
                      setOrdersOpen(true);
                      setToolsOpen(false);
                    }}
                    className={styles.dropdownLogoutButton}
                  >
                    📦 {lang === "ar" ? "طلباتي" : "My Orders"}
                  </button>
                  <button onClick={() => { logout(); setToolsOpen(false); }} className={styles.dropdownLogoutButton} style={{ opacity: 0.8 }}>
                    {t.logout}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setLoginOpen(true); setToolsOpen(false); }}
                  className={styles.dropdownLoginButton}
                >
                  {t.login}
                </button>
              )}
            </div>

            {/* Language & Theme Section */}
            <div className={styles.dropdownSection}>
              <button
                onClick={() => { changeLanguage(lang === "ar" ? "en" : "ar"); setToolsOpen(false); }}
                className={styles.dropdownActionBtn}
              >
                🌐 {lang === "ar" ? "English" : "العربية"}
              </button>
              <button
                onClick={() => { toggleTheme(); setToolsOpen(false); }}
                className={styles.dropdownActionBtn}
              >
                {theme === "light" ? "🌙" : "☀️"} {theme === "light" ? t.dark : t.light}
              </button>
            </div>


          </div>
        )}
      </div>

      {/* Cart Button (hidden in Blog mode) */}
      {appMode !== "blog" && (
        <button
          onClick={() => setCartOpen(!cartOpen)}
          className={`${styles.actionButton} ${styles.cartButton}`}
          aria-label="Open Shopping Cart"
        >
          🛒
          {cartCount > 0 && <span className={styles.cartCount}>{cartCount}</span>}
        </button>
      )}

      {/* Hamburger Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={styles.hamburger}
        aria-label="Toggle Navigation Menu"
      >
        {sidebarOpen ? "✖" : "☰"}
      </button>
    </div>
  );

  const navBlocks: Record<string, React.ReactNode> = {
    logo: logoBlock,
    nav: navBlock,
    search: searchBlock,
    tools: toolsBlock,
  };

  return (
    <>
      <header
        className={`${styles.header} ${!navbarSticky ? styles.navbarRelative : ''} ${styles[`layout_${navbarLayout}`]} ${styles[`theme_${navbarTheme}`]} ${scrolled ? styles.scrolled : ""} ${lang === "ar" ? styles.rtl : styles.ltr}`}
        style={headerInlineStyle}
      >
        <div className={styles.container}>
          {navbarOrder.map((key) => (
            <React.Fragment key={key}>{navBlocks[key] ?? null}</React.Fragment>
          ))}
        </div>


      </header>

      {/* Cart Slider Overlay */}
      {cartOpen && appMode !== "blog" && (
        <div className={styles.cartOverlay} onClick={() => setCartOpen(false)}>
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
                onClick={() => setCartOpen(false)} 
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
                      setCartOpen(false);
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
                  const nameStr = typeof item.product.name === "string"
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
                          {item.product.additionalData?.selectedVariants && Object.keys(item.product.additionalData.selectedVariants).length > 0 ? (
                            Object.entries(item.product.additionalData.selectedVariants).map(([gName, val]) => (
                              <span key={gName} className={styles.cartSpecChip}>
                                <span style={{ opacity: 0.7 }}>{gName}:</span>
                                {isColorVariantGroup(gName) && (
                                  <span style={{ 
                                    display: "inline-block", 
                                    width: "10px", 
                                    height: "10px", 
                                    borderRadius: "50%", 
                                    backgroundColor: parseColorHex(val),
                                    border: "1px solid var(--border)"
                                  }} />
                                )}
                                <span>{val}</span>
                              </span>
                            ))
                          ) : (
                            <>
                              {item.product.additionalData?.selectedPriceOptionKey && (
                                <span className={styles.cartSpecChip}>
                                  <span style={{ opacity: 0.7 }}>{lang === "ar" ? "الخيار: " : "Option: "}</span>
                                  <span>{item.product.additionalData.selectedPriceOptionKey}</span>
                                </span>
                              )}
                              
                              {item.product.additionalData?.selectedColor && (
                                <span className={styles.cartSpecChip}>
                                  <span style={{ opacity: 0.7 }}>{lang === "ar" ? "اللون: " : "Color: "}</span>
                                  <span style={{ 
                                    display: "inline-block", 
                                    width: "10px", 
                                    height: "10px", 
                                    borderRadius: "50%", 
                                    backgroundColor: parseColorHex(item.product.additionalData.selectedColor),
                                    border: "1px solid var(--border)"
                                  }} />
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
                              {formatPrice(item.product.price * item.quantity, organizationPolicy?.logistics?.currency, lang)}
                            </span>
                            {item.quantity > 1 && (
                              <span className={styles.cartItemPriceSingle}>
                                ({formatPrice(item.product.price, organizationPolicy?.logistics?.currency, lang)} / {lang === "ar" ? "قطعة" : "pc"})
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
                      {formatPrice(subtotal, organizationPolicy?.logistics?.currency, lang)}
                    </span>
                  </div>
                  
                  {sliceDiscount > 0 && (
                    <div className={styles.cartSummaryRow} style={{ color: "var(--accent)" }}>
                      <span className={styles.cartSummaryRowLabel}>
                        <span>🎁</span>
                        <span>{lang === "ar" ? "خصم الشريحة المستحق:" : "Slice Discount:"}</span>
                      </span>
                      <span className={styles.cartSummaryRowValue}>
                        -{formatPrice(sliceDiscount, organizationPolicy?.logistics?.currency, lang)}
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
                        ? formatPrice(shippingFee, organizationPolicy?.logistics?.currency, lang)
                        : (lang === "ar" ? "شحن مجاني" : "Free Shipping")}
                    </span>
                  </div>

                  {enableVat && taxPercentage > 0 && (
                    <div className={styles.cartSummaryRow}>
                      <span className={styles.cartSummaryRowLabel}>
                        <span>📊</span>
                        <span>{lang === "ar" ? `ضريبة القيمة المضافة (${taxPercentage}%):` : `VAT (${taxPercentage}%):`}</span>
                      </span>
                      <span className={styles.cartSummaryRowValue}>
                        {formatPrice(vatAmount, organizationPolicy?.logistics?.currency, lang)}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ height: "1px", background: "var(--border)", margin: "0.85rem 0" }} />

                <div className={styles.cartTotalRow}>
                  <span>{t.total}:</span>
                  <strong className={styles.cartTotalAmount}>
                    {formatPrice(finalTotal, organizationPolicy?.logistics?.currency, lang)}
                  </strong>
                </div>

                <button
                  onClick={() => {
                    if (!currentUser) {
                      alert(lang === "ar" ? "يجب تسجيل الدخول أولاً لإتمام الطلب" : "Please log in first to complete the order");
                      setLoginOpen(true);
                    } else {
                      setCheckoutError("");
                      setOrderSuccessData(null);
                      setCheckoutOpen(true);
                    }
                  }}
                  className="glowButton"
                  style={{ width: "100%", justifyContent: "center", marginTop: "0.85rem", padding: "0.9rem", fontSize: "1.02rem" }}
                >
                  <span>🛒</span>
                  <span>{lang === "ar" ? "متابعة تأكيد الطلب ➔" : "Proceed to Checkout ➔"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sidebar Slider Overlay */}
      {sidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)}>
          <div
            className={`${styles.sidebarDrawer} ${lang === "ar" ? styles.rtl : styles.ltr}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.sidebarHeader}>
              <h3>{lang === "ar" ? "المزيد" : "More"}</h3>
              <button onClick={() => setSidebarOpen(false)} className={styles.closeBtn}>
                ✕
              </button>
            </div>

            <div className={styles.sidebarContent}>
              {/* Mobile Search Bar */}
              {appMode !== "blog" && (
                <div className={`${styles.mobileSearchWrapper} ${styles.mobileOnlyLink}`} style={{ marginBottom: "1rem" }}>
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className={styles.mobileSearchInput}
                    style={{ width: "100%", padding: "0.6rem 1rem", paddingInlineEnd: "2.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)", fontFamily: "inherit" }}
                  />
                  <span className={styles.mobileSearchIcon}>🔍</span>
                </div>
              )}

              {/* Main navigation links (visible only on mobile) */}
              <div className={styles.mobileOnlyLinks}>
                <Link href="/" className={styles.sidebarLink} style={linkCustomStyle} onClick={() => setSidebarOpen(false)}>
                  {t.home}
                </Link>

                {(appMode === "blog" || appMode === "hybrid") && (
                  <Link href="/blog" className={styles.sidebarLink} style={linkCustomStyle} onClick={() => setSidebarOpen(false)}>
                    {t.blog}
                  </Link>
                )}

                {(appMode === "store" || appMode === "hybrid") && (
                  <Link href="/store" className={styles.sidebarLink} style={linkCustomStyle} onClick={() => setSidebarOpen(false)}>
                    {t.store}
                  </Link>
                )}

                {appMode === "hybrid" && (
                  <Link href="/hybrid" className={styles.sidebarLink} style={linkCustomStyle} onClick={() => setSidebarOpen(false)}>
                    {t.hybrid}
                  </Link>
                )}
              </div>

              {/* Dynamic Pages: on mobile show all navPages, on desktop show only excessPages */}
              {navPages.map((page, idx) => {
                const title = typeof page.title === "string" ? page.title : page.title?.[lang] || page.title?.ar || "";
                // If it is desktop, we only show it if its index is >= EXCESS_THRESHOLD (i.e. it's in excessPages)
                const isExcess = idx >= EXCESS_THRESHOLD;
                return (
                  <Link
                    key={page.id}
                    href={`/${page.slug}`}
                    className={`${styles.sidebarLink} ${!isExcess ? styles.mobileOnlyLink : ''}`}
                    style={linkCustomStyle}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {title}
                  </Link>
                );
              })}
              {/* Blog Categories (Show in sidebar if appMode is blog or hybrid) */}
              {(appMode === "blog" || appMode === "hybrid") && categories.length > 0 && (
                <div className={styles.sidebarSection}>
                  <span className={styles.sidebarSectionTitle}>
                    {lang === "ar" ? "أقسام المدونة" : "Blog Categories"}
                  </span>
                  {categories.map((cat) => {
                    const nameStr = typeof cat.name === "string" ? cat.name : cat.name?.[lang] || cat.name?.ar || "";
                    return (
                      <Link
                        key={cat.id}
                        href={`/blog?category=${cat.id}`}
                        className={styles.sidebarSubLink}
                        style={linkCustomStyle}
                        onClick={() => setSidebarOpen(false)}
                      >
                        📁 {nameStr}
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Product Categories (Show in sidebar if appMode is store or hybrid) */}
              {(appMode === "store" || appMode === "hybrid") && productCategories.length > 0 && (
                <div className={styles.sidebarSection}>
                  <span className={styles.sidebarSectionTitle}>
                    {lang === "ar" ? "أقسام المتجر" : "Store Categories"}
                  </span>
                  {productCategories.map((cat) => {
                    const nameStr = typeof cat.name === "string" ? cat.name : cat.name?.[lang] || cat.name?.ar || "";
                    return (
                      <Link
                        key={cat.id}
                        href={`/store?category=${cat.id}`}
                        className={styles.sidebarSubLink}
                        style={linkCustomStyle}
                        onClick={() => setSidebarOpen(false)}
                      >
                        📦 {nameStr}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Glassmorphic Login Modal */}
      {loginOpen && (
        <div className={styles.modalOverlay} onClick={() => setLoginOpen(false)}>
          <div
            className={`${styles.loginModal} ${lang === "ar" ? styles.rtl : styles.ltr}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setLoginOpen(false)} className={styles.modalCloseBtn}>
              ✕
            </button>
            <h3>
              {loginMethod === "signup"
                ? (lang === "ar" ? "إنشاء حساب جديد" : "Create Account")
                : (lang === "ar" ? "تسجيل الدخول" : "Log In")}
            </h3>

            <div style={{ display: "flex", gap: "0.5rem", margin: "1rem 0", justifyContent: "center" }}>
              <button
                type="button"
                className={`glowButton`}
                style={{
                  padding: "0.4rem 1rem",
                  fontSize: "0.85rem",
                  background: loginMethod === "login" ? "var(--primary)" : "var(--border)",
                  color: loginMethod === "login" ? "#fff" : "var(--fg)",
                  boxShadow: "none",
                }}
                onClick={() => {
                  setLoginMethod("login");
                  setAuthError("");
                }}
              >
                {lang === "ar" ? "تسجيل الدخول" : "Log In"}
              </button>
              <button
                type="button"
                className={`glowButton`}
                style={{
                  padding: "0.4rem 1rem",
                  fontSize: "0.85rem",
                  background: loginMethod === "signup" ? "var(--primary)" : "var(--border)",
                  color: loginMethod === "signup" ? "#fff" : "var(--fg)",
                  boxShadow: "none",
                }}
                onClick={() => {
                  setLoginMethod("signup");
                  setAuthError("");
                }}
              >
                {lang === "ar" ? "حساب جديد" : "Sign Up"}
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className={styles.loginForm}>
              {loginMethod === "login" && (
                <div className={styles.formGroup}>
                  <label>{lang === "ar" ? "رقم الهاتف" : "Phone Number"}</label>
                  <input
                    type="tel"
                    required
                    placeholder="010xxxxxx"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="customInput"
                  />
                </div>
              )}

              {loginMethod === "signup" && (
                <>
                  <div className={styles.formGroup}>
                    <label>{lang === "ar" ? "الاسم الكامل" : "Full Name"}</label>
                    <input
                      type="text"
                      required
                      placeholder={lang === "ar" ? "مثال: أحمد محمد" : "e.g. John Doe"}
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="customInput"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{lang === "ar" ? "رقم الهاتف" : "Phone Number"}</label>
                    <input
                      type="tel"
                      required
                      placeholder="010xxxxxx"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="customInput"
                    />
                  </div>
                </>
              )}

              {authError && <p className={styles.errorMessage}>{authError}</p>}
              <button type="submit" className="glowButton" style={{ width: "100%", justifyContent: "center" }}>
                {loginMethod === "signup"
                  ? (lang === "ar" ? "إنشاء حساب" : "Sign Up")
                  : (lang === "ar" ? "تسجيل الدخول" : "Log In")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div className={styles.modalOverlay} onClick={() => {
          if (!checkoutLoading) {
            setCheckoutOpen(false);
            setOrderSuccessData(null);
          }
        }}>
          <div
            className={`${styles.loginModal} ${lang === "ar" ? styles.rtl : styles.ltr}`}
            style={{ maxWidth: "860px", width: "95%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => {
                setCheckoutOpen(false);
                setOrderSuccessData(null);
              }} 
              className={styles.modalCloseBtn}
              aria-label={lang === "ar" ? "إغلاق" : "Close"}
            >
              ✕
            </button>

            {orderSuccessData ? (
              /* Celebration Order Placed Successfully Screen */
              <div className="orderSuccessCard">
                <div className="orderSuccessIconWrapper">
                  <span>✓</span>
                </div>
                
                <h3 className="orderSuccessTitle">
                  {lang === "ar" ? "🎉 تم استلام وتأكيد طلبك بنجاح!" : "🎉 Order Placed Successfully!"}
                </h3>
                
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "color-mix(in srgb, var(--primary) 10%, transparent)",
                  padding: "0.4rem 1rem",
                  borderRadius: "20px",
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  color: "var(--primary)"
                }}>
                  <span>{lang === "ar" ? "رقم الطلب:" : "Order ID:"}</span>
                  <span>#{orderSuccessData.orderId.toString().slice(-8).toUpperCase()}</span>
                </div>

                <p className="orderSuccessSubtitle">
                  {lang === "ar"
                    ? `شكراً لثقتك بنا يا ${orderSuccessData.recipientName}. تم تسجيل طلبك المكون من (${orderSuccessData.itemsCount}) منتجات بإجمالي ${formatPrice(orderSuccessData.total, organizationPolicy?.logistics?.currency, lang)}، وسنتواصل معك قريباً على رقم ${orderSuccessData.recipientPhone} لتأكيد موعد التسليم.`
                    : `Thank you for your order, ${orderSuccessData.recipientName}! Your order of (${orderSuccessData.itemsCount}) items with a total of ${formatPrice(orderSuccessData.total, organizationPolicy?.logistics?.currency, lang)} has been received. We will contact you soon on ${orderSuccessData.recipientPhone}.`}
                </p>

                <div className="orderSuccessActions">
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutOpen(false);
                      setOrderSuccessData(null);
                      setOrdersOpen(true);
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
                      setCheckoutOpen(false);
                      setOrderSuccessData(null);
                      setCartOpen(false);
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
                      transition: "all 0.2s ease"
                    }}
                  >
                    {lang === "ar" ? "متابعة التسوق ➔" : "Continue Shopping ➔"}
                  </button>
                </div>
              </div>
            ) : (
              /* Standard Checkout Review and Shipping Form */
              <>
                <h3 style={{ textAlign: "center", marginBottom: "0.25rem", fontSize: "1.35rem", fontWeight: "800" }}>
                  <span>🛒</span> {lang === "ar" ? "تأكيد تفاصيل الشحن والطلب" : "Confirm Shipping & Order Details"}
                </h3>
                <p style={{ textAlign: "center", fontSize: "0.88rem", opacity: 0.75, marginBottom: "1.25rem" }}>
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
                        <span>{lang === "ar" ? "بيانات المستلم والتوصيل" : "Recipient & Delivery Info"}</span>
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
                          <option value="">{lang === "ar" ? "-- اختر المحافظة --" : "-- Select Governorate --"}</option>
                          {checkoutGovList.map((gov) => {
                            const nameStr = typeof gov.name === "string" 
                              ? gov.name 
                              : gov.name?.[lang] || gov.name?.ar || gov.name?.en || gov.id;
                            return (
                              <option key={gov.id} value={gov.id}>
                                {nameStr}
                              </option>
                            );
                          })}
                        </select>

                        {/* Dynamic shipping hint badge */}
                        {checkoutGovernorate && (
                          <div className="shippingFeeHint">
                            {(() => {
                              let govFeeVal = 0;
                              let isFree = false;
                              if (organizationPolicy?.shipping) {
                                isFree = organizationPolicy.shipping.freeShippingEnabled === true;
                                if (!isFree) {
                                  govFeeVal = organizationPolicy.shipping.defaultFee || 0;
                                  if (organizationPolicy.shipping.feesByGovernorate) {
                                    const customFee = organizationPolicy.shipping.feesByGovernorate[checkoutGovernorate];
                                    if (typeof customFee === "number") govFeeVal = customFee;
                                  }
                                }
                              }
                              return isFree || govFeeVal === 0
                                ? (lang === "ar" ? "✨ شحن مجاني لهذه المحافظة!" : "✨ Free shipping for this governorate!")
                                : (lang === "ar" 
                                    ? `🚚 رسوم الشحن للمحافظة المحددة: ${formatPrice(govFeeVal, organizationPolicy?.logistics?.currency, lang)}`
                                    : `🚚 Shipping fee for this governorate: ${formatPrice(govFeeVal, organizationPolicy?.logistics?.currency, lang)}`);
                            })()}
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
                          <option value="">{lang === "ar" ? "-- اختر المدينة --" : "-- Select City --"}</option>
                          {checkoutCityList.map((ct) => {
                            const nameStr = typeof ct.name === "string" 
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
                          placeholder={lang === "ar" ? "اسم الشارع، رقم العمارة، الشقة، علامة مميزة" : "Street, Building, Apartment, Landmark"}
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
                        <span>{lang === "ar" ? "ملخص الطلب والفاتورة" : "Order & Invoice Summary"}</span>
                      </div>

                      {/* Order Items List */}
                      <div style={{ maxHeight: "170px", overflowY: "auto", paddingInlineEnd: "4px" }}>
                        {cart.map((item, idx) => {
                          const nameStr = typeof item.product.name === "string"
                            ? item.product.name
                            : item.product.name?.[lang] || item.product.name?.ar || "";
                          return (
                            <div key={idx} className="summaryItemRow">
                              {item.product.imageUrl && (
                                <img src={item.product.imageUrl} alt="" className="summaryItemImg" />
                              )}
                              <div className="summaryItemMeta">
                                <span className="summaryItemTitle">{nameStr}</span>
                                {item.product.additionalData?.selectedVariants && Object.keys(item.product.additionalData.selectedVariants).length > 0 ? (
                                  <span style={{ fontSize: "0.75rem", opacity: 0.75 }}>
                                    {Object.entries(item.product.additionalData.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                                  </span>
                                ) : item.product.additionalData?.selectedColor || item.product.additionalData?.selectedSize ? (
                                  <span style={{ fontSize: "0.75rem", opacity: 0.75 }}>
                                    {[item.product.additionalData.selectedColor, item.product.additionalData.selectedSize].filter(Boolean).join(' - ')}
                                  </span>
                                ) : null}
                                <span className="summaryItemQty">
                                  {lang === "ar" ? `الكمية: ${item.quantity}` : `Qty: ${item.quantity}`}
                                </span>
                              </div>
                              <span className="summaryItemPrice">
                                {formatPrice(item.product.price * item.quantity, organizationPolicy?.logistics?.currency, lang)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Available Discount Tiers Banner */}
                      {slices.length > 0 && (
                        <div className="rewardsTierBanner">
                          <div className="rewardsTierBannerTitle">
                            <span>🎁</span>
                            <span>{lang === "ar" ? "عروض شرائح الخصم النشطة:" : "Active Tier Discounts:"}</span>
                          </div>
                          <ul style={{ margin: 0, paddingInlineStart: "1.2rem", lineHeight: 1.5 }}>
                            {slices.map((slice, idx) => (
                              <li key={idx}>
                                {lang === "ar" 
                                  ? `خصم ${formatPrice(slice.discountAmount, organizationPolicy?.logistics?.currency, lang)} عند الشراء بقيمة ${formatPrice(slice.minAmount, organizationPolicy?.logistics?.currency, lang)} أو أكثر`
                                  : `Get ${formatPrice(slice.discountAmount, organizationPolicy?.logistics?.currency, lang)} OFF on orders of ${formatPrice(slice.minAmount, organizationPolicy?.logistics?.currency, lang)}+`
                                }
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Billing review rows */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", fontSize: "0.88rem", marginTop: "0.25rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ opacity: 0.85 }}>{lang === "ar" ? "إجمالي المنتجات:" : "Products Total:"}</span>
                          <strong style={{ whiteSpace: "nowrap" }}>{formatPrice(subtotal, organizationPolicy?.logistics?.currency, lang)}</strong>
                        </div>

                        {sliceDiscount > 0 && (
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--accent)" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <span>🎁</span>
                              <span>{lang === "ar" ? "خصم الشريحة المستحق:" : "Slice Discount:"}</span>
                            </span>
                            <strong style={{ whiteSpace: "nowrap" }}>-{formatPrice(sliceDiscount, organizationPolicy?.logistics?.currency, lang)}</strong>
                          </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ opacity: 0.85, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <span>🚚</span>
                            <span>{lang === "ar" ? "رسوم الشحن للمحافظة:" : "Governorate Shipping:"}</span>
                          </span>
                          <strong style={{ whiteSpace: "nowrap" }}>
                            {(() => {
                              let tempShipping = 0;
                              if (organizationPolicy?.shipping) {
                                const isFree = organizationPolicy.shipping.freeShippingEnabled === true;
                                if (!isFree) {
                                  tempShipping = organizationPolicy.shipping.defaultFee || 0;
                                  if (checkoutGovernorate && organizationPolicy.shipping.feesByGovernorate) {
                                    const govFee = organizationPolicy.shipping.feesByGovernorate[checkoutGovernorate];
                                    if (typeof govFee === "number") tempShipping = govFee;
                                  }
                                }
                              }
                              return tempShipping > 0 
                                ? formatPrice(tempShipping, organizationPolicy?.logistics?.currency, lang)
                                : (lang === "ar" ? "مجاني" : "Free");
                            })()}
                          </strong>
                        </div>

                        {enableVat && taxPercentage > 0 && (
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ opacity: 0.85, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <span>🧾</span>
                              <span>{lang === "ar" ? `ضريبة القيمة المضافة (${taxPercentage}%):` : `VAT (${taxPercentage}%):`}</span>
                            </span>
                            <strong style={{ whiteSpace: "nowrap" }}>{formatPrice(vatAmount, organizationPolicy?.logistics?.currency, lang)}</strong>
                          </div>
                        )}

                        {/* Final Grand Total Card (Never Breaking Currency) */}
                        <div className="finalTotalCard">
                          <span className="finalTotalTitle">{lang === "ar" ? "المبلغ الإجمالي النهائي:" : "Final Grand Total:"}</span>
                          <span className="finalTotalAmount">
                            {(() => {
                              let tempShipping = 0;
                              if (organizationPolicy?.shipping) {
                                const isFree = organizationPolicy.shipping.freeShippingEnabled === true;
                                if (!isFree) {
                                  tempShipping = organizationPolicy.shipping.defaultFee || 0;
                                  if (checkoutGovernorate && organizationPolicy.shipping.feesByGovernorate) {
                                    const govFee = organizationPolicy.shipping.feesByGovernorate[checkoutGovernorate];
                                    if (typeof govFee === "number") tempShipping = govFee;
                                  }
                                }
                              }
                              const newTotal = Math.max(0, subtotal - sliceDiscount + tempShipping + vatAmount);
                              return formatPrice(newTotal, organizationPolicy?.logistics?.currency, lang);
                            })()}
                          </span>
                        </div>

                        <button
                          type="submit"
                          disabled={checkoutLoading}
                          className="glowButton"
                          style={{ width: "100%", justifyContent: "center", marginTop: "0.75rem", padding: "0.9rem", fontSize: "1.02rem" }}
                        >
                          {checkoutLoading ? (
                            <>
                              <span>⏳</span>
                              <span>{lang === "ar" ? "جاري تأكيد وإرسال الطلب..." : "Placing your order..."}</span>
                            </>
                          ) : (
                            <>
                              <span>🔒</span>
                              <span>{lang === "ar" ? "تأكيد وإرسال الطلب الآن" : "Confirm & Place Order Now"}</span>
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
      )}

      {/* Orders List Modal */}
      {ordersOpen && (
        <div className={styles.modalOverlay} onClick={() => setOrdersOpen(false)}>
          <div
            className={`${styles.loginModal} ${lang === "ar" ? styles.rtl : styles.ltr}`}
            style={{ maxWidth: "700px", width: "95%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setOrdersOpen(false)} className={styles.modalCloseBtn}>
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
                      ? (typeof order.workflow.stepInfo.name === "string" 
                          ? order.workflow.stepInfo.name 
                          : order.workflow.stepInfo.name[lang] || order.workflow.stepInfo.name.ar)
                      : (lang === "ar" ? "قيد المراجعة" : "Under Review");
                      
                    const dateStr = new Date(order.createdAt).toLocaleDateString(
                      lang === "ar" ? "ar-EG" : "en-US",
                      { year: "numeric", month: "short", day: "numeric" }
                    );

                    return (
                      <div key={order.id} className="glassCard" style={{ padding: "1rem", borderRadius: "var(--radius-sm, 6px)", border: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                          <span style={{ fontWeight: "bold" }}>#{order.id.slice(-6).toUpperCase()}</span>
                          <span style={{
                            background: "var(--primary)",
                            color: "#fff",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.78rem"
                          }}>
                            {statusName}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", opacity: 0.8 }}>
                          <span>{dateStr}</span>
                          <strong>{formatPrice(order.totalOrderPrice, organizationPolicy?.logistics?.currency, lang)}</strong>
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
      )}

      {/* Settings / Edit Profile Modal */}
      {settingsOpen && (
        <div className={styles.modalOverlay} onClick={() => setSettingsOpen(false)}>
          <div
            className={`${styles.loginModal} ${lang === "ar" ? styles.rtl : styles.ltr}`}
            style={{ maxWidth: "520px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setSettingsOpen(false)} className={styles.modalCloseBtn}>
              ✕
            </button>
            <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
              👤 {lang === "ar" ? "تعديل الملف الشخصي" : "Edit Profile"}
            </h3>
            
            <form onSubmit={handleSettingsSubmit} className={styles.loginForm}>
              <div className="customInputGroup">
                <label className="inputLabel">
                  <span className="labelIcon">👤</span>
                  <span>{lang === "ar" ? "الاسم" : "Name"}</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === "ar" ? "الاسم الكامل" : "Full Name"}
                  value={settingsName}
                  onChange={(e) => setSettingsName(e.target.value)}
                  className="customInput"
                />
              </div>

              <div className="customInputGroup">
                <label className="inputLabel">
                  <span className="labelIcon">📱</span>
                  <span>{lang === "ar" ? "رقم الهاتف" : "Phone Number"}</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="010xxxxxx"
                  value={settingsPhone}
                  onChange={(e) => setSettingsPhone(e.target.value)}
                  className="customInput"
                />
              </div>

              <div className="customInputGroup">
                <label className="inputLabel">
                  <span className="labelIcon">🌍</span>
                  <span>{lang === "ar" ? "الدولة" : "Country"}</span>
                </label>
                <select
                  value={settingsCountryId}
                  onChange={(e) => handleSettingsCountryChange(e.target.value)}
                  className="customInput customSelect"
                  required
                >
                  <option value="">{lang === "ar" ? "-- اختر الدولة --" : "-- Select Country --"}</option>
                  {countries.map((c) => {
                    const nameStr = typeof c.name === "string"
                      ? c.name
                      : c.name?.[lang] || c.name?.ar || c.name?.en || c.id;
                    return (
                      <option key={c.id} value={c.id}>
                        {nameStr}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="customInputGroup">
                <label className="inputLabel">
                  <span className="labelIcon">🏛️</span>
                  <span>{lang === "ar" ? "المحافظة" : "Governorate"}</span>
                </label>
                <select
                  value={settingsGovId}
                  onChange={(e) => handleSettingsGovChange(e.target.value)}
                  className="customInput customSelect"
                  required
                  disabled={!settingsCountryId}
                >
                  <option value="">{lang === "ar" ? "-- اختر المحافظة --" : "-- Select Governorate --"}</option>
                  {governorates.map((g) => {
                    const nameStr = typeof g.name === "string"
                      ? g.name
                      : g.name?.[lang] || g.name?.ar || g.name?.en || g.id;
                    return (
                      <option key={g.id} value={g.id}>
                        {nameStr}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="customInputGroup">
                <label className="inputLabel">
                  <span className="labelIcon">🏙️</span>
                  <span>{lang === "ar" ? "المدينة" : "City"}</span>
                </label>
                <select
                  value={settingsCityId}
                  onChange={(e) => setSettingsCityId(e.target.value)}
                  className="customInput customSelect"
                  required
                  disabled={!settingsGovId}
                >
                  <option value="">{lang === "ar" ? "-- اختر المدينة --" : "-- Select City --"}</option>
                  {cities.map((ct) => {
                    const nameStr = typeof ct.name === "string"
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
                  placeholder={lang === "ar" ? "الشارع، رقم البناء، الشقة" : "Street, Building, Apartment"}
                  value={settingsAddress}
                  onChange={(e) => setSettingsAddress(e.target.value)}
                  className="customInput"
                />
              </div>

              <button
                type="submit"
                disabled={settingsLoading}
                className="glowButton"
                style={{ width: "100%", justifyContent: "center", marginTop: "1rem", padding: "0.85rem" }}
              >
                {settingsLoading 
                  ? (lang === "ar" ? "⏳ جاري الحفظ..." : "⏳ Saving...")
                  : (lang === "ar" ? "💾 حفظ التغييرات" : "💾 Save Changes")}
              </button>
            </form>
          </div>
        </div>
      )}

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
}
