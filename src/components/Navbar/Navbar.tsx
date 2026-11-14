"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useCartSummary } from "@/hooks/useCartSummary";
import FeedbackModal from "../FeedbackModal/FeedbackModal";
import CartDrawer from "../features/cart/CartDrawer";
import AuthModal from "../features/auth/AuthModal";
import CheckoutModal from "../features/checkout/CheckoutModal";
import OrdersHistoryModal from "../features/orders/OrdersHistoryModal";
import ProfileSettingsModal from "../features/profile/ProfileSettingsModal";
import clientConfig from "@/config/clientConfig.json";
import styles from "./Navbar.module.css";

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
    currentUser,
    logout,
    navPages,
    t,
    appTitle,
    categories,
    productCategories,
  } = useApp();

  const { cartCount } = useCartSummary();

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
  const [mobileBlogExpanded, setMobileBlogExpanded] = useState(false);
  const [mobileStoreExpanded, setMobileStoreExpanded] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState<string | null>(null);

  const headerRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure exact rendered navbar top-bar height (including safe-area-inset-top)
  // and dynamically update --navbar-height so content beneath is never obscured
  useEffect(() => {
    const updateNavbarHeight = () => {
      if (containerRef.current && headerRef.current) {
        const computedStyle = window.getComputedStyle(headerRef.current);
        const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
        const containerHeight = containerRef.current.getBoundingClientRect().height;
        const totalHeight = Math.round(containerHeight + paddingTop);
        if (totalHeight > 0) {
          document.documentElement.style.setProperty('--navbar-height', `${totalHeight}px`);
        }
      }
    };

    updateNavbarHeight();
    window.addEventListener('resize', updateNavbarHeight);
    window.addEventListener('orientationchange', updateNavbarHeight);
    return () => {
      window.removeEventListener('resize', updateNavbarHeight);
      window.removeEventListener('orientationchange', updateNavbarHeight);
    };
  }, []);

  // Close desktop dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (desktopDropdownOpen && headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setDesktopDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [desktopDropdownOpen]);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll to add glass shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on page change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCartOpen(false);
    setSettingsOpen(false);
    setSidebarOpen(false);
    setToolsOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile sidebar drawer or cart is open
  useEffect(() => {
    if (sidebarOpen || cartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen, cartOpen]);

  const navAdv = config?.website?.navbarAdvanced;
  const excessMode = config?.website?.excessLinksMode ?? 'dropdown';
  const isDropdownMode = excessMode === 'dropdown';
  const showBlogCats = config?.website?.showBlogCategoriesInNavbar !== false;
  const showStoreCats = config?.website?.showStoreCategoriesInNavbar !== false;
  const linksStyle = config?.website?.navbarLinksStyle ?? 'classic';
  const navbarLayout =
    navAdv?.layoutStyle === 'floating_pill'
      ? 'floating'
      : config?.website?.navbarLayout ?? 'classic';
  const navbarTheme = config?.website?.navbarTheme ?? 'glass';
  // navbarSticky: true = fixed to top (default), false = scrolls with page
  const navbarSticky =
    navAdv?.scrollBehavior === 'static'
      ? false
      : config?.website?.navbarSticky ?? true;

  const isCustomTheme = navbarTheme === 'custom';
  const customNavbarBg = isCustomTheme ? (config?.website?.customNavbarBg || config?.website?.navbarBg) : undefined;
  const customNavbarTextColor = isCustomTheme ? (config?.website?.customNavbarTextColor || config?.website?.navbarTextColor) : undefined;

  // Toggle whether to display brand title next to logo
  const showNavbarTitle =
    config?.website?.navbarShowTitle ??
    config?.website?.showTitle ??
    true;

  // Logo styling driven by config.website.logoStyle ("solid" | "gradient") or custom text color
  const logoStyle = config?.website?.logoStyle ?? "solid";
  const logoTextStyle: React.CSSProperties =
    navbarTheme === "accent"
      ? { color: "#ffffff", WebkitTextFillColor: "#ffffff" }
      : customNavbarTextColor
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
      {showNavbarTitle && (
        <span className={styles.logoText} style={logoTextStyle}>
          {appTitle}
        </span>
      )}
    </Link>
  );

  const searchBlock =
    appMode !== "blog" && navAdv?.showSearch !== false ? (
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

      {/* 1. Hybrid Mode: Show Home, Blog dropdown (if enabled), and Store dropdown (if enabled) */}
      {appMode === "hybrid" && (
        <>
          {showBlogCats && (
            <div className={styles.dropdownContainer}>
              <div style={{ display: "inline-flex", alignItems: "center" }}>
                <Link href="/blog" className={`${styles.navLink} ${pathname.startsWith("/blog") ? styles.active : ""}`} style={linkCustomStyle}>
                  {t.blog}
                </Link>
                {categories.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDesktopDropdownOpen(desktopDropdownOpen === "blog" ? null : "blog");
                    }}
                    className={styles.dropdownToggle}
                    style={{ background: "transparent", border: "none", cursor: "pointer", font: "inherit", padding: "0 0.25rem", ...linkCustomStyle }}
                    aria-label={lang === "ar" ? "أقسام المدونة" : "Blog categories"}
                  >
                    ▾
                  </button>
                )}
              </div>
              {categories.length > 0 && (
                <div className={`${styles.dropdownMenu} ${desktopDropdownOpen === "blog" ? styles.dropdownMenuOpen : ""}`} style={dropdownMenuStyle}>
                  <Link href="/blog" className={styles.dropdownItem} style={linkCustomStyle} onClick={() => setDesktopDropdownOpen(null)}>
                    {lang === "ar" ? "كل المقالات" : "All Posts"}
                  </Link>
                  {categories.map((cat) => {
                    const nameStr = typeof cat.name === "string" ? cat.name : cat.name?.[lang] || cat.name?.ar || "";
                    return (
                      <Link key={cat.id} href={`/blog?category=${cat.id}`} className={styles.dropdownItem} style={linkCustomStyle} onClick={() => setDesktopDropdownOpen(null)}>
                        {nameStr}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {showStoreCats && (
            <div className={styles.dropdownContainer}>
              <div style={{ display: "inline-flex", alignItems: "center" }}>
                <Link href="/store" className={`${styles.navLink} ${pathname.startsWith("/store") ? styles.active : ""}`} style={linkCustomStyle}>
                  {t.store}
                </Link>
                {productCategories.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDesktopDropdownOpen(desktopDropdownOpen === "store" ? null : "store");
                    }}
                    className={styles.dropdownToggle}
                    style={{ background: "transparent", border: "none", cursor: "pointer", font: "inherit", padding: "0 0.25rem", ...linkCustomStyle }}
                    aria-label={lang === "ar" ? "أقسام المتجر" : "Store categories"}
                  >
                    ▾
                  </button>
                )}
              </div>
              {productCategories.length > 0 && (
                <div className={`${styles.dropdownMenu} ${desktopDropdownOpen === "store" ? styles.dropdownMenuOpen : ""}`} style={dropdownMenuStyle}>
                  <Link href="/store" className={styles.dropdownItem} style={linkCustomStyle} onClick={() => setDesktopDropdownOpen(null)}>
                    {lang === "ar" ? "كل المنتجات" : "All Products"}
                  </Link>
                  {productCategories.map((cat) => {
                    const nameStr = typeof cat.name === "string" ? cat.name : cat.name?.[lang] || cat.name?.ar || "";
                    return (
                      <Link key={cat.id} href={`/store?category=${cat.id}`} className={styles.dropdownItem} style={linkCustomStyle} onClick={() => setDesktopDropdownOpen(null)}>
                        {nameStr}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* 2. Store-only Mode: Show Home, 'Our Products' link, and 'Categories' dropdown only if showStoreCats is enabled */}
      {appMode === "store" && showStoreCats && (
        <>
          <Link href="/store" className={`${styles.navLink} ${pathname === "/store" ? styles.active : ""}`} style={linkCustomStyle}>
            {lang === "ar" ? "منتجاتنا" : "Our Products"}
          </Link>

          {productCategories.length > 0 && (
            <div className={styles.dropdownContainer}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDesktopDropdownOpen(desktopDropdownOpen === "store_cats" ? null : "store_cats");
                }}
                className={`${styles.navLink} ${styles.dropdownToggle} ${pathname.includes("category") ? styles.active : ""}`}
                style={{ background: "transparent", border: "none", cursor: "pointer", font: "inherit", ...linkCustomStyle }}
              >
                {lang === "ar" ? "الأقسام" : "Categories"} ▾
              </button>
              <div className={`${styles.dropdownMenu} ${desktopDropdownOpen === "store_cats" ? styles.dropdownMenuOpen : ""}`} style={dropdownMenuStyle}>
                <Link href="/store" className={styles.dropdownItem} style={linkCustomStyle} onClick={() => setDesktopDropdownOpen(null)}>
                  {lang === "ar" ? "كل المنتجات" : "All Products"}
                </Link>
                {productCategories.map((cat) => {
                  const nameStr = typeof cat.name === "string" ? cat.name : cat.name?.[lang] || cat.name?.ar || "";
                  return (
                    <Link key={cat.id} href={`/store?category=${cat.id}`} className={styles.dropdownItem} style={linkCustomStyle} onClick={() => setDesktopDropdownOpen(null)}>
                      {nameStr}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* 3. Blog-only Mode: Show Blog link & Categories dropdown only if showBlogCats is enabled */}
      {appMode === "blog" && showBlogCats && (
        <div className={styles.dropdownContainer}>
          <div style={{ display: "inline-flex", alignItems: "center" }}>
            <Link
              href="/blog"
              className={`${styles.navLink} ${pathname.startsWith("/blog") ? styles.active : ""}`}
              style={linkCustomStyle}
            >
              {t.blog}
            </Link>
            {categories.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDesktopDropdownOpen(desktopDropdownOpen === "blog" ? null : "blog");
                }}
                className={styles.dropdownToggle}
                style={{ background: "transparent", border: "none", cursor: "pointer", font: "inherit", padding: "0 0.25rem", ...linkCustomStyle }}
                aria-label={lang === "ar" ? "أقسام المدونة" : "Blog categories"}
              >
                ▾
              </button>
            )}
          </div>
          {categories.length > 0 && (
            <div className={`${styles.dropdownMenu} ${desktopDropdownOpen === "blog" ? styles.dropdownMenuOpen : ""}`} style={dropdownMenuStyle}>
              <Link href="/blog" className={styles.dropdownItem} style={linkCustomStyle} onClick={() => setDesktopDropdownOpen(null)}>
                {lang === "ar" ? "كل المقالات" : "All Posts"}
              </Link>
              {categories.map((cat) => {
                const nameStr = typeof cat.name === "string" ? cat.name : cat.name?.[lang] || cat.name?.ar || "";
                return (
                  <Link key={cat.id} href={`/blog?category=${cat.id}`} className={styles.dropdownItem} style={linkCustomStyle} onClick={() => setDesktopDropdownOpen(null)}>
                    {nameStr}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
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
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDesktopDropdownOpen(desktopDropdownOpen === "excess" ? null : "excess");
            }}
            className={`${styles.navLink} ${styles.dropdownToggle}`}
            style={{ background: "transparent", border: "none", cursor: "pointer", font: "inherit", padding: 0, ...linkCustomStyle }}
          >
            {lang === "ar" ? "المزيد ▾" : "More ▾"}
          </button>
          <div className={`${styles.dropdownMenu} ${desktopDropdownOpen === "excess" ? styles.dropdownMenuOpen : ""}`} style={dropdownMenuStyle}>
            {excessPages.map((page) => {
              const title = typeof page.title === "string" ? page.title : page.title?.[lang] || page.title?.ar || "";
              return (
                <Link
                  key={page.id}
                  href={`/${page.slug}`}
                  className={styles.dropdownItem}
                  style={linkCustomStyle}
                  onClick={() => setDesktopDropdownOpen(null)}
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

      {/* Direct WhatsApp Button (NavbarAdvancedConfig) */}
      {navAdv?.directWhatsApp?.show && (
        <a
          href={`https://wa.me/${(navAdv.directWhatsApp.phoneNumber || config?.socialMedia?.whatsapp || "").replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.actionButton} ${styles.hideOnMobileTopBar}`}
          style={{
            background: "rgba(37, 211, 102, 0.14)",
            color: "#25D366",
            borderColor: "rgba(37, 211, 102, 0.35)",
            padding: navAdv.directWhatsApp.label ? "0.4rem 0.85rem" : undefined,
            width: navAdv.directWhatsApp.label ? "auto" : undefined,
            borderRadius: "999px",
            fontSize: "0.85rem",
            fontWeight: 700,
            gap: "0.35rem",
          }}
          title="WhatsApp"
        >
          <span>💬</span>
          {navAdv.directWhatsApp.label && (
            <span>
              {typeof navAdv.directWhatsApp.label === "string"
                ? navAdv.directWhatsApp.label
                : navAdv.directWhatsApp.label[lang] || navAdv.directWhatsApp.label.ar}
            </span>
          )}
        </a>
      )}

      {/* Primary CTA Button (NavbarAdvancedConfig) */}
      {navAdv?.primaryCta?.show && (
        <Link
          href={navAdv.primaryCta.link || "/store"}
          className={`glowButton ${styles.hideOnMobileTopBar}`}
          style={{ padding: "0.45rem 1rem", fontSize: "0.85rem", borderRadius: "999px" }}
        >
          {typeof navAdv.primaryCta.text === "string"
            ? navAdv.primaryCta.text
            : navAdv.primaryCta.text?.[lang] || navAdv.primaryCta.text?.ar || ""}
        </Link>
      )}

      {/* Cart Button (hidden in Blog mode or when disabled via navbarAdvanced.showCart) */}
      {appMode !== "blog" && navAdv?.showCart !== false && (
        <button
          onClick={() => setCartOpen(!cartOpen)}
          className={`${styles.actionButton} ${styles.cartButton}`}
          aria-label="Open Shopping Cart"
        >
          🛒
          {cartCount > 0 && <span className={styles.cartCount}>{cartCount}</span>}
        </button>
      )}

      {/* Hamburger Button: Always toggles the unified Side Menu Drawer on mobile */}
      <button
        onClick={() => {
          setSidebarOpen((prev) => !prev);
          setMobileMenuOpen(false);
        }}
        className={styles.hamburger}
        aria-label="Toggle Navigation Menu"
      >
        {sidebarOpen ? "✕" : "☰"}
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
        ref={headerRef}
        className={`${styles.header} ${!navbarSticky ? styles.navbarRelative : ''} ${styles[`layout_${navbarLayout}`]} ${styles[`theme_${navbarTheme}`]} ${scrolled ? styles.scrolled : ""} ${lang === "ar" ? styles.rtl : styles.ltr}`}
        style={headerInlineStyle}
      >
        <div ref={containerRef} className={styles.container}>
          {navbarOrder.map((key) => (
            <React.Fragment key={key}>{navBlocks[key] ?? null}</React.Fragment>
          ))}
        </div>

        {/* Mobile Dropdown Drawer (attached directly below navbar when excessLinksMode is 'dropdown') */}
        {isDropdownMode && mobileMenuOpen && (
          <div className={`${styles.mobileDrawer} ${lang === "ar" ? styles.rtl : styles.ltr}`}>
            {/* Mobile Search Bar */}
            {appMode !== "blog" && navAdv?.showSearch !== false && (
              <div className={styles.mobileSearchWrapper}>
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className={styles.mobileSearchInput}
                />
                <span className={styles.mobileSearchIcon}>🔍</span>
              </div>
            )}

            {/* Main Navigation Links */}
            <div className={styles.mobileNavLinksList}>
              <Link
                href="/"
                className={styles.mobileNavLink}
                style={linkCustomStyle}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{t.home}</span>
              </Link>

              {(appMode === "blog" || appMode === "hybrid") && showBlogCats && (
                categories.length > 0 ? (
                  <div className={styles.mobileNavAccordion}>
                    <div
                      className={styles.mobileNavAccordionHeader}
                      onClick={() => setMobileBlogExpanded((prev) => !prev)}
                    >
                      <div className={styles.mobileNavAccordionTitle}>
                        <span>📝</span>
                        <span>{t.blog}</span>
                      </div>
                      <span className={`${styles.accordionChevron} ${mobileBlogExpanded ? styles.chevronOpen : ""}`}>
                        {mobileBlogExpanded ? "▴" : "▾"}
                      </span>
                    </div>
                    {mobileBlogExpanded && (
                      <div className={styles.mobileAccordionSubList}>
                        <Link
                          href="/blog"
                          className={styles.mobileAccordionSubLink}
                          style={linkCustomStyle}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setSidebarOpen(false);
                          }}
                        >
                          ✦ {lang === "ar" ? "كل المقالات" : "All Posts"}
                        </Link>
                        {categories.map((cat) => {
                          const nameStr = typeof cat.name === "string" ? cat.name : cat.name?.[lang] || cat.name?.ar || "";
                          return (
                            <Link
                              key={cat.id}
                              href={`/blog?category=${cat.id}`}
                              className={styles.mobileAccordionSubLink}
                              style={linkCustomStyle}
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setSidebarOpen(false);
                              }}
                            >
                              📁 {nameStr}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/blog"
                    className={styles.mobileNavLink}
                    style={linkCustomStyle}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSidebarOpen(false);
                    }}
                  >
                    <span>📝</span>
                    <span>{t.blog}</span>
                  </Link>
                )
              )}

              {(appMode === "store" || appMode === "hybrid") && showStoreCats && (
                productCategories.length > 0 ? (
                  <div className={styles.mobileNavAccordion}>
                    <div
                      className={styles.mobileNavAccordionHeader}
                      onClick={() => setMobileStoreExpanded((prev) => !prev)}
                    >
                      <div className={styles.mobileNavAccordionTitle}>
                        <span>🛍️</span>
                        <span>{t.store}</span>
                      </div>
                      <span className={`${styles.accordionChevron} ${mobileStoreExpanded ? styles.chevronOpen : ""}`}>
                        {mobileStoreExpanded ? "▴" : "▾"}
                      </span>
                    </div>
                    {mobileStoreExpanded && (
                      <div className={styles.mobileAccordionSubList}>
                        <Link
                          href="/store"
                          className={styles.mobileAccordionSubLink}
                          style={linkCustomStyle}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setSidebarOpen(false);
                          }}
                        >
                          ✦ {lang === "ar" ? "كل المنتجات" : "All Products"}
                        </Link>
                        {productCategories.map((cat) => {
                          const nameStr = typeof cat.name === "string" ? cat.name : cat.name?.[lang] || cat.name?.ar || "";
                          return (
                            <Link
                              key={cat.id}
                              href={`/store?category=${cat.id}`}
                              className={styles.mobileAccordionSubLink}
                              style={linkCustomStyle}
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setSidebarOpen(false);
                              }}
                            >
                              📦 {nameStr}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/store"
                    className={styles.mobileNavLink}
                    style={linkCustomStyle}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSidebarOpen(false);
                    }}
                  >
                    <span>🛍️</span>
                    <span>{t.store}</span>
                  </Link>
                )
              )}

              {/* Dynamic Pages */}
              {navPages.map((page) => {
                const title = typeof page.title === "string" ? page.title : page.title?.[lang] || page.title?.ar || "";
                return (
                  <Link
                    key={page.id}
                    href={`/${page.slug}`}
                    className={styles.mobileNavLink}
                    style={linkCustomStyle}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{title}</span>
                  </Link>
                );
              })}
            </div>

            {/* Categories Chips */}
            {((appMode === "blog" && categories.length > 0) ||
              (appMode === "store" && productCategories.length > 0) ||
              (appMode === "hybrid" && (categories.length > 0 || productCategories.length > 0))) && (
              <div className={styles.mobileDrawerSection}>
                <span className={styles.mobileDrawerSectionTitle}>
                  {lang === "ar" ? "التصنيفات" : "Categories"}
                </span>
                <div className={styles.mobileDrawerChips}>
                  {(appMode === "store" ? productCategories : categories).slice(0, 10).map((cat: any) => {
                    const name = typeof cat.name === "string" ? cat.name : cat.name?.[lang] || cat.name?.ar || "";
                    const targetHref = appMode === "blog" ? `/blog?category=${cat.id}` : `/store?category=${cat.id}`;
                    return (
                      <Link
                        key={cat.id}
                        href={targetHref}
                        className={styles.mobileDrawerChip}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}


      </header>

      {/* Cart Slider Overlay */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onProceedToCheckout={() => setCheckoutOpen(true)}
        onRequireLogin={() => setLoginOpen(true)}
      />

      {/* Sidebar Slider Overlay */}
      {sidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)}>
          <div
            className={`${styles.sidebarDrawer} ${lang === "ar" ? styles.rtl : styles.ltr}`}
            style={{
              fontFamily: "var(--font-family, inherit)",
              ...headerInlineStyle,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.sidebarHeader}>
              <div className={styles.sidebarHeaderLogo}>
                {config?.visual?.logoUrl ? (
                  <img
                    src={config.visual.logoUrl}
                    alt={appTitle}
                    className={styles.sidebarLogoImage}
                  />
                ) : (
                  <span className={styles.logoIcon}>◆</span>
                )}
                <span className={styles.sidebarBrandTitle} style={logoTextStyle}>{appTitle}</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className={styles.closeBtn}
                aria-label={lang === "ar" ? "إغلاق القائمة" : "Close Menu"}
              >
                ✕
              </button>
            </div>

            <div className={styles.sidebarContent}>
              {/* Mobile Search Bar */}
              {appMode !== "blog" && navAdv?.showSearch !== false && (
                <div className={styles.sidebarSearchWrapper}>
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className={styles.sidebarSearchInput}
                  />
                  <span className={styles.sidebarSearchIcon}>🔍</span>
                </div>
              )}

              {/* Main navigation links */}
              <div className={styles.sidebarNavGroup}>
                <Link
                  href="/"
                  className={`${styles.sidebarLink} ${pathname === "/" ? styles.sidebarLinkActive : ""}`}
                  style={linkCustomStyle}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span>🏠</span>
                  <span>{t.home}</span>
                </Link>

                {(appMode === "store" || appMode === "hybrid") && showStoreCats && (
                  productCategories.length > 0 ? (
                    <div className={styles.mobileNavAccordion}>
                      <div
                        className={styles.mobileNavAccordionHeader}
                        onClick={() => setMobileStoreExpanded((prev) => !prev)}
                      >
                        <div className={styles.mobileNavAccordionTitle}>
                          <span>🛍️</span>
                          <span>{t.store}</span>
                        </div>
                        <span className={`${styles.accordionChevron} ${mobileStoreExpanded ? styles.chevronOpen : ""}`}>
                          {mobileStoreExpanded ? "▴" : "▾"}
                        </span>
                      </div>
                      {mobileStoreExpanded && (
                        <div className={styles.mobileAccordionSubList}>
                          <Link
                            href="/store"
                            className={styles.mobileAccordionSubLink}
                            style={linkCustomStyle}
                            onClick={() => {
                              setSidebarOpen(false);
                              setMobileMenuOpen(false);
                            }}
                          >
                            ✦ {lang === "ar" ? "كل المنتجات" : "All Products"}
                          </Link>
                          {productCategories.map((cat) => {
                            const nameStr = typeof cat.name === "string" ? cat.name : cat.name?.[lang] || cat.name?.ar || "";
                            return (
                              <Link
                                key={cat.id}
                                href={`/store?category=${cat.id}`}
                                className={styles.mobileAccordionSubLink}
                                style={linkCustomStyle}
                                onClick={() => {
                                  setSidebarOpen(false);
                                  setMobileMenuOpen(false);
                                }}
                              >
                                📦 {nameStr}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href="/store"
                      className={`${styles.sidebarLink} ${pathname.startsWith("/store") ? styles.sidebarLinkActive : ""}`}
                      style={linkCustomStyle}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span>🛍️</span>
                      <span>{t.store}</span>
                    </Link>
                  )
                )}

                {(appMode === "blog" || appMode === "hybrid") && showBlogCats && (
                  showBlogCats && categories.length > 0 ? (
                    <div className={styles.mobileNavAccordion}>
                      <div
                        className={styles.mobileNavAccordionHeader}
                        onClick={() => setMobileBlogExpanded((prev) => !prev)}
                      >
                        <div className={styles.mobileNavAccordionTitle}>
                          <span>📝</span>
                          <span>{t.blog}</span>
                        </div>
                        <span className={`${styles.accordionChevron} ${mobileBlogExpanded ? styles.chevronOpen : ""}`}>
                          {mobileBlogExpanded ? "▴" : "▾"}
                        </span>
                      </div>
                      {mobileBlogExpanded && (
                        <div className={styles.mobileAccordionSubList}>
                          <Link
                            href="/blog"
                            className={styles.mobileAccordionSubLink}
                            style={linkCustomStyle}
                            onClick={() => {
                              setSidebarOpen(false);
                              setMobileMenuOpen(false);
                            }}
                          >
                            ✦ {lang === "ar" ? "كل المقالات" : "All Posts"}
                          </Link>
                          {categories.map((cat) => {
                            const nameStr = typeof cat.name === "string" ? cat.name : cat.name?.[lang] || cat.name?.ar || "";
                            return (
                              <Link
                                key={cat.id}
                                href={`/blog?category=${cat.id}`}
                                className={styles.mobileAccordionSubLink}
                                style={linkCustomStyle}
                                onClick={() => {
                                  setSidebarOpen(false);
                                  setMobileMenuOpen(false);
                                }}
                              >
                                📁 {nameStr}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href="/blog"
                      className={`${styles.sidebarLink} ${pathname.startsWith("/blog") ? styles.sidebarLinkActive : ""}`}
                      style={linkCustomStyle}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span>📝</span>
                      <span>{t.blog}</span>
                    </Link>
                  )
                )}

                {appMode === "hybrid" && (
                  <Link
                    href="/hybrid"
                    className={`${styles.sidebarLink} ${pathname === "/hybrid" ? styles.sidebarLinkActive : ""}`}
                    style={linkCustomStyle}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span>🌐</span>
                    <span>{t.hybrid}</span>
                  </Link>
                )}

                {/* Dynamic Pages */}
                {navPages.map((page) => {
                  const title = typeof page.title === "string" ? page.title : page.title?.[lang] || page.title?.ar || "";
                  return (
                    <Link
                      key={page.id}
                      href={`/${page.slug}`}
                      className={`${styles.sidebarLink} ${pathname === `/${page.slug}` ? styles.sidebarLinkActive : ""}`}
                      style={linkCustomStyle}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span>📄</span>
                      <span>{title}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Store Categories (Show in sidebar only if enabled and appMode is store or hybrid) */}
              {showStoreCats && (appMode === "store" || appMode === "hybrid") && productCategories.length > 0 && (
                <div className={styles.sidebarSection}>
                  <span className={styles.sidebarSectionTitle}>
                    {lang === "ar" ? "أقسام المتجر" : "Store Categories"}
                  </span>
                  <div className={styles.sidebarChipsGrid}>
                    {productCategories.map((cat) => {
                      const nameStr = typeof cat.name === "string" ? cat.name : cat.name?.[lang] || cat.name?.ar || "";
                      return (
                        <Link
                          key={cat.id}
                          href={`/store?category=${cat.id}`}
                          className={styles.sidebarChipItem}
                          style={linkCustomStyle}
                          onClick={() => setSidebarOpen(false)}
                        >
                          📦 {nameStr}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Blog Categories (Show in sidebar only if enabled and appMode is blog or hybrid) */}
              {showBlogCats && (appMode === "blog" || appMode === "hybrid") && categories.length > 0 && (
                <div className={styles.sidebarSection}>
                  <span className={styles.sidebarSectionTitle}>
                    {lang === "ar" ? "أقسام المدونة" : "Blog Categories"}
                  </span>
                  <div className={styles.sidebarChipsGrid}>
                    {categories.map((cat) => {
                      const nameStr = typeof cat.name === "string" ? cat.name : cat.name?.[lang] || cat.name?.ar || "";
                      return (
                        <Link
                          key={cat.id}
                          href={`/blog?category=${cat.id}`}
                          className={styles.sidebarChipItem}
                          style={linkCustomStyle}
                          onClick={() => setSidebarOpen(false)}
                        >
                          📁 {nameStr}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tools & Settings Section */}
              <div className={styles.sidebarSection}>
                <span className={styles.sidebarSectionTitle}>
                  {lang === "ar" ? "الإعدادات والحساب" : "Settings & Account"}
                </span>

                {currentUser ? (
                  <div className={styles.sidebarUserBox}>
                    <div className={styles.sidebarUserInfo}>
                      <span>👤</span>
                      <strong>{currentUser.name || currentUser.username}</strong>
                    </div>
                    <button
                      onClick={() => {
                        setOrdersOpen(true);
                        setSidebarOpen(false);
                      }}
                      className={styles.sidebarActionBtn}
                    >
                      📦 {lang === "ar" ? "طلباتي" : "My Orders"}
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setSidebarOpen(false);
                      }}
                      className={styles.sidebarActionBtn}
                      style={{ color: "#ef4444" }}
                    >
                      🚪 {t.logout}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setLoginOpen(true);
                      setSidebarOpen(false);
                    }}
                    className={styles.sidebarActionBtn}
                  >
                    👤 {t.login}
                  </button>
                )}

                {/* Language Switch */}
                <button
                  onClick={() => {
                    changeLanguage(lang === "ar" ? "en" : "ar");
                    setSidebarOpen(false);
                  }}
                  className={styles.sidebarActionBtn}
                >
                  🌐 {lang === "ar" ? "English" : "العربية"}
                </button>

                {/* Theme Switch */}
                <button
                  onClick={() => {
                    toggleTheme();
                  }}
                  className={styles.sidebarActionBtn}
                >
                  {theme === "light" ? "🌙" : "☀️"} {theme === "light" ? (lang === "ar" ? "الوضع الداكن" : "Dark Mode") : (lang === "ar" ? "الوضع الفاتح" : "Light Mode")}
                </button>

                {/* Direct WhatsApp */}
                {(navAdv?.directWhatsApp?.show || config?.socialMedia?.whatsapp) && (
                  <a
                    href={`https://wa.me/${(navAdv?.directWhatsApp?.phoneNumber || config?.socialMedia?.whatsapp || "").replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.sidebarWhatsAppBtn}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span>💬</span>
                    <span>{lang === "ar" ? "تواصل معنا عبر واتساب" : "Chat on WhatsApp"}</span>
                  </a>
                )}

                {/* Feedback Modal */}
                <button
                  onClick={() => {
                    setFeedbackOpen(true);
                    setSidebarOpen(false);
                  }}
                  className={styles.sidebarFeedbackBtn}
                >
                  💬 {lang === "ar" ? "إبداء رأيك بالموقع" : "Send Feedback"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Modals */}
      <AuthModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onOrderSuccessViewOrders={() => {
          setCheckoutOpen(false);
          setOrdersOpen(true);
        }}
        onContinueShopping={() => {
          setCheckoutOpen(false);
          setCartOpen(false);
        }}
        onRequireLogin={() => setLoginOpen(true)}
      />

      <OrdersHistoryModal isOpen={ordersOpen} onClose={() => setOrdersOpen(false)} />

      <ProfileSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
}
