"use client";

import React, { useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";

// Blog Components
import HeroSection from "@/components/blog/HeroSection";
import FeaturedPost from "@/components/blog/FeaturedPost";
import TrendingSection from "@/components/blog/TrendingSection";
import CategoryPills from "@/components/blog/CategoryPills";
import PostGrid from "@/components/blog/PostGrid";
import JokerPost from "@/components/blog/JokerPost";
import NewsletterSignup from "@/components/blog/NewsletterSignup";

// Store Components
import StoreHero from "@/components/store/StoreHero";
import CategoryGrid from "@/components/store/CategoryGrid";
import ProductGrid from "@/components/store/ProductGrid";
import PromotedOffers from "@/components/store/PromotedOffers";
import TrustBadges from "@/components/store/TrustBadges";
import Testimonials from "@/components/store/Testimonials";
import FAQSection from "@/components/store/FAQSection";
import FeaturesGrid from "@/components/store/FeaturesGrid";
import TabsShowcase from "@/components/store/TabsShowcase";
import Showcase from "@/components/store/Showcase";
import PricingSection from "@/components/store/PricingSection";
import ContactUs from "@/components/store/ContactUs";

// Hybrid layouts
import Link from "next/link";
import IntroSlides from "@/components/intro/IntroSlides";
import { getIntroConfigFromSection, normalizeIntroDisplayMode } from "@/utils/introConfig";
import styles from "./Home.module.css";

function HomepageContent() {
  const {
    config,
    products,
    productCategories,
    categories,
    posts,
    offers,
    loading,
    lang,
    appMode,
    setAppMode,
    searchQuery,
    addToCart,
    t,
  } = useApp();

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";

  React.useEffect(() => {
    if (pathname === "/") {
      const defaultMode = config?.website?.appMode || "blog";
      if (appMode !== defaultMode) {
        setAppMode(defaultMode);
      }
    }
  }, [pathname, config, appMode, setAppMode]);

  const [activeBlogCategory, setActiveBlogCategory] = useState("all");
  const [activeStoreCategory, setActiveStoreCategory] = useState("all");

  React.useEffect(() => {
    if (categoryParam) {
      if (appMode === "blog") {
        setActiveBlogCategory(categoryParam);
      } else {
        setActiveStoreCategory(categoryParam);
      }
    }
  }, [categoryParam, appMode]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname, categoryParam]);

  const handleSelectBlogCategory = (catId: string) => {
    setActiveBlogCategory(catId);
    const url = new URL(window.location.href);
    if (catId === "all") {
      url.searchParams.delete("category");
    } else {
      url.searchParams.set("category", catId);
    }
    window.history.pushState({}, "", url.toString());
  };

  const handleSelectStoreCategory = (catId: string) => {
    setActiveStoreCategory(catId);
    const url = new URL(window.location.href);
    if (catId === "all") {
      url.searchParams.delete("category");
    } else {
      url.searchParams.set("category", catId);
    }
    window.history.pushState({}, "", url.toString());
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner}></div>
        <span>{lang === "ar" ? "جاري تحميل الموقع..." : "Loading website..."}</span>
      </div>
    );
  }

  // Fallback section presets if config is missing or offline
  const defaultSections =
    appMode === "blog"
      ? [
          { id: "intro", type: "intro_slides", isActive: true },
          { id: "categories", type: "categories", isActive: true },
          { id: "blog_posts", type: "blog_posts", isActive: true },
        ]
      : appMode === "store"
      ? [
          { id: "intro", type: "intro_slides", isActive: true },
          { id: "offers", type: "offers", isActive: true },
          { id: "categories", type: "categories", isActive: true },
          { id: "new_products", type: "new_products", isActive: true },
          { id: "best_sellers", type: "best_seller", isActive: true },
        ]
      : [
          // Hybrid presets
          { id: "intro", type: "intro_slides", isActive: true },
          { id: "offers", type: "offers", isActive: true },
          { id: "categories", type: "categories", isActive: true },
          { id: "new_products", type: "new_products", isActive: true },
          { id: "blog_posts", type: "blog_posts", isActive: true },
        ];

  const websiteConfig = config?.website || { sections: defaultSections };
  const activeSections = (websiteConfig.sections || defaultSections).filter((s) => s.isActive);

  // Filters for Blog Posts
  const filteredPosts = posts.filter((post) => {
    const postCatName = typeof post.blogCategoryId === "string" ? post.blogCategoryId : "";
    const matchesCategory =
      activeBlogCategory === "all" ||
      postCatName === activeBlogCategory ||
      post.slug.includes(activeBlogCategory);
    
    const titleText = typeof post.title === "string" ? post.title : post.title?.[lang] || post.title?.ar || "";
    const descObj = post.seoDescription || (post as any).description;
    const descText = typeof descObj === "string" ? descObj : descObj?.[lang as any] || descObj?.ar || "";
    const contentText = typeof post.content === "string" ? post.content : post.content?.[lang] || post.content?.ar || "";
    
    const matchesSearch =
      searchQuery.trim() === "" ||
      titleText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      descText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contentText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filters for Store Products
  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeStoreCategory === "all" || product.categoryId === activeStoreCategory;
    
    const nameText = typeof product.name === "string" ? product.name : product.name?.[lang] || product.name?.ar || "";
    const descText = product.additionalData?.description || "";
    
    const matchesSearch =
      searchQuery.trim() === "" ||
      nameText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      descText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isSearching = searchQuery.trim().length > 0;
  const featured = filteredPosts.find((p) => p.isFeatured) || filteredPosts[0];
  const trending = filteredPosts.slice(0, 3);

  // RENDER SECTIONS CORRESPONDING TO CONFIG
  const renderSection = (section: any) => {
    const sType = (section.type || "").toLowerCase().trim();

    const isBoxed = section.config?.boxedLayout === true;
    const hasShadow = section.config?.hasShadow === true;

    // wrapper to apply boxed layout and shadow dynamically
    const wrapInLayout = (content: React.ReactNode) => {
      if (!isBoxed) return content;
      return (
        <div key={`wrap-${section.id}`} className={`${styles.boxedSection} ${hasShadow ? styles.shadowSection : ''}`}>
          {content}
        </div>
      );
    };

    // 1. INTRO / HERO SLIDES
    if (sType === "intro_slides" || sType === "intro" || sType === "hero") {
      const introConfig = getIntroConfigFromSection(section, appMode);
      const hasIntroPosts = posts.some(
        (p) => p.postType === "intro" && p.isActive !== false
      );
      const hasIntroConfig = Object.keys(introConfig).length > 0;

      // Use config-driven intro slides when configured or intro content exists;
      // otherwise fall back to the legacy curated heroes.
      if (hasIntroPosts || hasIntroConfig) {
        return wrapInLayout(
          <IntroSlides
            key={section.id}
            config={introConfig}
            displayMode={normalizeIntroDisplayMode(section.displayMode)}
            title={section.title}
            description={section.description}
          />
        );
      }

      if (appMode === "blog") {
        return wrapInLayout(<HeroSection key={section.id} />);
      } else if (appMode === "store") {
        return wrapInLayout(<StoreHero key={section.id} />);
      } else {
        // Hybrid custom banner
        return wrapInLayout(
          <section key={section.id} className={`${styles.hybridHero} animateFadeUp`}>
            <div className={styles.heroGlow}></div>
            <div className={styles.heroContent}>
              <span className={styles.hybridBadge}>⚡ {t.hybrid}</span>
              <h1>
                {lang === "ar"
                  ? "تسوق بذكاء واقرأ بشغف في مكان واحد"
                  : "Shop Smart & Read Passionately In One Place"}
              </h1>
              <p>
                {lang === "ar"
                  ? "نجمع لك أفضل المنتجات التكنولوجية والإكسسوارات مع مقالات شيقة وأدلة تعليمية تفصيلية تثري معرفتك."
                  : "Connecting the finest digital gears and accessories with captivating stories, news and in-depth guides."}
              </p>
              <div className={styles.heroBtns}>
                <a href="#store-sec" className="glowButton">
                  🛍️ {lang === "ar" ? "تصفح المنتجات" : "Browse Shop"}
                </a>
              </div>
            </div>
          </section>
        );
      }
    }

    // 2. OFFERS BANNER
    if (sType === "offers" && appMode !== "blog") {
      return wrapInLayout(<PromotedOffers key={section.id} variant={section.config?.variant} />);
    }

    // 3. CATEGORIES FILTERS
    if (sType === "categories") {
      if (appMode === "blog") {
        return wrapInLayout(
          <div key={section.id} className={styles.filterWrapper}>
            <div className={styles.sectionHeader}>
              <div className={styles.titleArea}>
                <h2 className={styles.sectionTitle}>
                  {section.title || (lang === "ar" ? "تصفح مقالات المدونة" : "Browse Articles")}
                </h2>
                {section.description && (
                  <p className={styles.sectionSubtitle}>{section.description}</p>
                )}
              </div>
            </div>
            <CategoryPills
              activeCategory={activeBlogCategory}
              onSelectCategory={handleSelectBlogCategory}
            />
          </div>
        );
      } else {
        return wrapInLayout(
          <CategoryGrid
            key={section.id}
            activeCategory={activeStoreCategory}
            onSelectCategory={handleSelectStoreCategory}
            title={section.title}
            description={section.description}
            variant={section.config?.variant}
          />
        );
      }
    }

    // 4. NEW PRODUCTS & BEST SELLERS
    if ((sType === "new_products" || sType === "best_seller" || sType === "products") && appMode !== "blog") {
      const isNew = sType === "new_products";
      const isBest = sType === "best_seller";
      let list = filteredProducts.filter((p) => {
        if (isNew) return p.isNew;
        if (isBest) return p.isBestSeller;
        return true;
      });

      const limit = section.config?.limit;
      if (typeof limit === "number" && limit > 0) list = list.slice(0, limit);

      if (list.length === 0) return null;

      const columns = section.config?.crossAxisCount;

      return wrapInLayout(
        <div key={section.id} id="store-sec" className={styles.storeSectionBlock}>
          <div className={styles.sectionHeader}>
            <div className={styles.titleArea}>
              <h2 className={styles.sectionTitle}>
                {section.title ||
                  (sType === "new_products"
                    ? (lang === "ar" ? "وصل حديثاً" : "New Arrivals")
                    : (lang === "ar" ? "الأكثر مبيعاً" : "Best Sellers"))}
              </h2>
              {section.description && (
                <p className={styles.sectionSubtitle}>{section.description}</p>
              )}
            </div>
            <Link href="/store" className={styles.viewAllBtn}>
              {lang === "ar" ? "عرض الكل" : "View All"} {lang === "ar" ? "←" : "→"}
            </Link>
          </div>
          <ProductGrid products={list} columns={columns} />
        </div>
      );
    }

    // 5. BLOG POSTS LISTS (latest, most-read, featured/joker)
    const jokerSectionAliases = new Set([
      "joker_post",
      "joker_posts",
      "jocker_post",
      "jocker_posts",
      "jokerpost",
      "jockerpost",
    ]);
    const isJokerSection = jokerSectionAliases.has(sType);
    if (
      (sType === "blog_posts" || sType === "most_read_posts" || isJokerSection) &&
      appMode !== "store"
    ) {
      const isJoker = isJokerSection;
      const isMostRead = sType === "most_read_posts";

      let list = filteredPosts.filter((p) => {
        if (isJoker) return p.isJoker;
        if (isMostRead) return p.isMost;
        return true;
      });
      // most_read fallback: if none flagged, show all so the section isn't empty.
      if (isMostRead && list.length === 0) list = filteredPosts;
      // joker fallback: support environments where only one legacy flag maps through.
      if (isJoker && list.length === 0) list = filteredPosts;

      const limit = section.config?.limit;
      if (typeof limit === "number" && limit > 0) list = list.slice(0, limit);

      if (list.length === 0) return null;

      if (isJoker) {
        return wrapInLayout(
          <JokerPost
            key={section.id}
            posts={list}
            title={section.title}
            description={section.description}
            config={section.config}
          />
        );
      }

      const defaultTitle = isMostRead
        ? (lang === "ar" ? "الأكثر قراءة" : "Most Read")
        : (lang === "ar" ? "آخر مقالات المدونة" : "Latest Articles");

      return wrapInLayout(
        <div key={section.id} id="blog-sec" className={styles.blogSectionBlock}>
          <div className={styles.sectionHeader}>
            <div className={styles.titleArea}>
              <h2 className={styles.sectionTitle}>{section.title || defaultTitle}</h2>
              {section.description && (
                <p className={styles.sectionSubtitle}>{section.description}</p>
              )}
            </div>
            <Link href="/blog" className={styles.viewAllBtn}>
              {lang === "ar" ? "عرض الكل" : "View All"} {lang === "ar" ? "←" : "→"}
            </Link>
          </div>
          {/* Featured Post Card in normal state */}
          {!isSearching && featured && !isMostRead && (
            <FeaturedPost post={featured} />
          )}
          <PostGrid posts={list} displayMode={section.displayMode} />
        </div>
      );
    }

    // 6. BANNER / CUSTOM BANNER
    if (sType === "banner" || sType === "custom_banner") {
      const variant = section.config?.variant || "promo_card";
      
      const titleText = section.title 
        || section.config?.title 
        || (lang === "ar" ? "اقرأ دليلنا الشامل لمنتجاتنا الموصى بها!" : "Read our comprehensive guides!");
      
      // Determine description: check section.description, section.config.description, and fallback to imageUrl if it's text
      const configImgUrl = section.config?.imageUrl || "";
      const isImgUrlActualLink = configImgUrl.startsWith("http") || configImgUrl.startsWith("/") || configImgUrl.includes(".");
      
      const descText = section.description 
        || section.config?.description 
        || (!isImgUrlActualLink ? configImgUrl : "")
        || (lang === "ar" ? "احصل على عروض مذهلة اليوم." : "Get amazing deals today.");
        
      const buttonText = section.config?.buttonText || (lang === "ar" ? "تصفح الآن" : "Browse Now");
      const buttonLink = section.config?.buttonLink || section.config?.linkUrl || "/store";
      
      const bannerBgImage = isImgUrlActualLink ? configImgUrl : "";

      if (variant === "offers_box") {
        return wrapInLayout(
          <section key={section.id} className={`${styles.offersSection} animateFadeUp`} style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "3rem 1.5rem" }}>
            <div 
              className={`${styles.offersBox} glassCard`} 
              style={{ 
                padding: "3rem 2rem", 
                borderRadius: "var(--radius-lg)",
                backgroundImage: bannerBgImage ? `url(${bannerBgImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className={styles.offersContent} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem", textAlign: "center" }}>
                <span className={styles.offersBadge}>{lang === "ar" ? "عرض خاص" : "Special Offer"}</span>
                <h3 style={{ fontSize: "clamp(1.4rem, 1.2rem + 1.2vw, 2.2rem)", fontWeight: "800", margin: 0 }}>{titleText}</h3>
                <p style={{ opacity: 0.7, margin: 0 }}>{descText}</p>
                <Link href={buttonLink} className="glowButton">
                  {buttonText}
                </Link>
              </div>
            </div>
          </section>
        );
      }

      // Default: promo_card (the long horizontal banner layout)
      return wrapInLayout(
        <section key={section.id} className={`${styles.promoBanner} animateFadeUp`}>
          <div 
            className={`${styles.promoCard} glassCard`}
            style={{ 
              backgroundImage: bannerBgImage ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${bannerBgImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: bannerBgImage ? '#fff' : 'inherit'
            }}
          >
            <div className={styles.promoText}>
              <h3>{titleText}</h3>
              <p style={{ color: bannerBgImage ? '#eee' : 'inherit' }}>{descText}</p>
            </div>
            <div className={styles.promoActions}>
              <Link href={buttonLink} className="glowButton">
                {buttonText}
              </Link>
            </div>
          </div>
        </section>
      );
    }

    // 7. ABOUT COMPANY / SINGLE POST (مقال كامل مستقل)
    if (sType === "about_company" && appMode !== "store") {
      const slug = section.config?.postSlug;
      if (!slug) return null;
      const post = posts.find((p) => p.slug === slug);
      if (!post) return null;
      
      const titleStr = typeof post.title === "string" ? post.title : post.title?.[lang as any] || post.title?.ar || "";
      const contentStr = typeof post.content === "string" ? post.content : post.content?.[lang as any] || post.content?.ar || "";
      const imgUrl = post.imageUrl || (post as any).image;
      
      // موضع الصورة المحدد (يسار افتراضياً)
      const imgPosition = section.config?.imagePosition ?? 'left';
      const contentClass = `${styles.aboutCompanyContent} ${styles[`imgPos_${imgPosition}`]}`;

      return wrapInLayout(
        <section key={section.id} className={styles.aboutCompanySectionBlock}>
          <div className={styles.sectionHeader}>
            <div className={styles.titleArea}>
              <h2 className={styles.sectionTitle}>{section.title || titleStr}</h2>
              {section.description && (
                <p className={styles.sectionSubtitle}>{section.description}</p>
              )}
            </div>
          </div>
          <div className={contentClass}>
            {imgUrl && (
              <div className={styles.aboutCompanyImageWrapper}>
                <img src={imgUrl} alt={titleStr} className={styles.aboutCompanyImage} />
              </div>
            )}
            <div className={styles.aboutCompanyText}>
              {contentStr.split("\n\n").map((paragraph, idx) => (
                <p key={idx} className={styles.aboutParagraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      );
    }

    // 8. TRUST BADGES
    if (sType === "trust_badges") {
      return wrapInLayout(<TrustBadges key={section.id} items={section.config?.items} />);
    }

    // 9. TESTIMONIALS
    if (sType === "testimonials") {
      return wrapInLayout(<Testimonials key={section.id} />);
    }

    // 10. FAQS
    if (sType === "faqs") {
      return wrapInLayout(<FAQSection key={section.id} items={section.config?.items} />);
    }

    // 11. NEWSLETTER SIGNUP
    if (sType === "newsletter_signup") {
      return wrapInLayout(<NewsletterSignup key={section.id} />);
    }

    // 12. FEATURES GRID
    if (sType === "features") {
      return wrapInLayout(
        <FeaturesGrid
          key={section.id}
          items={section.config?.items}
          title={section.title}
          description={section.description}
        />
      );
    }

    // 13. TABS SHOWCASE (system architecture)
    if (sType === "tabs_showcase") {
      return wrapInLayout(
        <TabsShowcase
          key={section.id}
          tabs={section.config?.tabs}
          title={section.title}
          description={section.description}
        />
      );
    }

    // 14. SHOWCASE (mockup gallery)
    if (sType === "showcase") {
      return wrapInLayout(
        <Showcase
          key={section.id}
          tabs={section.config?.tabs}
          title={section.title}
          description={section.description}
        />
      );
    }

    // 15. PRICING
    if (sType === "pricing") {
      return wrapInLayout(
        <PricingSection
          key={section.id}
          plans={section.config?.plans}
          title={section.title}
          description={section.description}
          displayMode={section.displayMode}
        />
      );
    }

    // 16. CONTACT US
    if (sType === "contact_us") {
      return wrapInLayout(
        <ContactUs
          key={section.id}
          config={section.config}
          title={section.title}
          description={section.description}
        />
      );
    }

    return null;
  };

  const selectedCategoryObj = productCategories.find((c) => String(c.id) === String(activeStoreCategory));
  const categoryName = selectedCategoryObj
    ? (typeof selectedCategoryObj.name === "string"
        ? selectedCategoryObj.name
        : selectedCategoryObj.name?.[lang] || selectedCategoryObj.name?.ar || "")
    : "";

  const selectedBlogCategoryObj = categories.find((c) => String(c.id) === String(activeBlogCategory));
  const blogCategoryName = selectedBlogCategoryObj
    ? (typeof selectedBlogCategoryObj.name === "string"
        ? selectedBlogCategoryObj.name
        : selectedBlogCategoryObj.name?.[lang] || selectedBlogCategoryObj.name?.ar || "")
    : "";

  return (
    <div
      className={styles.wrapper}
      style={config?.website?.navbarSticky === false ? { paddingTop: 0 } : undefined}
    >
      <Navbar />

      <main className={styles.main}>
        {isSearching ? (
          /* Search Results Feed */
          <div className={`${styles.searchPage} ${lang === "ar" ? styles.rtl : styles.ltr}`}>
            <div className={styles.searchHeader}>
              <h2>
                {t.searchBtn} &quot;{searchQuery}&quot;
              </h2>
              <p>
                {t.bothResults
                  .replace("{p}", String(appMode !== "blog" ? filteredProducts.length : 0))
                  .replace("{a}", String(appMode !== "store" ? filteredPosts.length : 0))}
              </p>
            </div>

            <div className={styles.resultsGrid}>
              {/* Products column */}
              {appMode !== "blog" && (
                <div className={styles.resultsCol}>
                  <h3>🛒 {t.store} ({filteredProducts.length})</h3>
                  {filteredProducts.length > 0 ? (
                    <ProductGrid products={filteredProducts} />
                  ) : (
                    <p className={styles.emptyColMsg}>{lang === "ar" ? "لا توجد منتجات مطابقة." : "No matching products."}</p>
                  )}
                </div>
              )}

              {/* Articles column */}
              {appMode !== "store" && (
                <div className={styles.resultsCol}>
                  <h3>✍️ {t.blog} ({filteredPosts.length})</h3>
                  {filteredPosts.length > 0 ? (
                    <PostGrid posts={filteredPosts} />
                  ) : (
                    <p className={styles.emptyColMsg}>{lang === "ar" ? "لا توجد مقالات مطابقة." : "No matching articles."}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (appMode !== "blog" && activeStoreCategory !== "all") ? (
          /* Store Category Filter Feed */
          <div className={`${styles.searchPage} ${lang === "ar" ? styles.rtl : styles.ltr}`}>
            <div className={styles.searchHeader}>
              <span className={styles.hybridBadge} style={{ display: "inline-block", marginBottom: "0.5rem" }}>
                📁 {lang === "ar" ? "القسم" : "Category"}
              </span>
              <h2 style={{ fontSize: "2rem", fontWeight: "700" }}>{categoryName}</h2>
              <p style={{ opacity: 0.8, marginTop: "0.25rem" }}>
                {lang === "ar"
                  ? `تم العثور على ${filteredProducts.length} منتج`
                  : `Found ${filteredProducts.length} products`}
              </p>
              <button
                onClick={() => handleSelectStoreCategory("all")}
                className="glowButton"
                style={{ marginTop: "1rem", padding: "0.4rem 1.2rem", fontSize: "0.85rem", height: "auto" }}
              >
                {lang === "ar" ? "عرض كل المنتجات والأقسام" : "Show All Products & Categories"}
              </button>
            </div>
            <div className={styles.resultsGrid} style={{ display: "block" }}>
              <div className={styles.resultsCol}>
                {filteredProducts.length > 0 ? (
                  <ProductGrid products={filteredProducts} />
                ) : (
                  <p className={styles.emptyColMsg}>{lang === "ar" ? "لا توجد منتجات في هذا القسم حالياً." : "No products in this category currently."}</p>
                )}
              </div>
            </div>
          </div>
        ) : (appMode !== "store" && activeBlogCategory !== "all") ? (
          /* Blog Category Filter Feed */
          <div className={`${styles.searchPage} ${lang === "ar" ? styles.rtl : styles.ltr}`}>
            <div className={styles.searchHeader}>
              <span className={styles.hybridBadge} style={{ display: "inline-block", marginBottom: "0.5rem" }}>
                📁 {lang === "ar" ? "القسم" : "Category"}
              </span>
              <h2 style={{ fontSize: "2rem", fontWeight: "700" }}>{blogCategoryName}</h2>
              <p style={{ opacity: 0.8, marginTop: "0.25rem" }}>
                {lang === "ar"
                  ? `تم العثور على ${filteredPosts.length} مقال`
                  : `Found ${filteredPosts.length} articles`}
              </p>
              <button
                onClick={() => handleSelectBlogCategory("all")}
                className="glowButton"
                style={{ marginTop: "1rem", padding: "0.4rem 1.2rem", fontSize: "0.85rem", height: "auto" }}
              >
                {lang === "ar" ? "عرض كل المقالات والأقسام" : "Show All Articles & Categories"}
              </button>
            </div>
            <div className={styles.resultsGrid} style={{ display: "block" }}>
              <div className={styles.resultsCol}>
                {filteredPosts.length > 0 ? (
                  <PostGrid posts={filteredPosts} />
                ) : (
                  <p className={styles.emptyColMsg}>{lang === "ar" ? "لا توجد مقالات في هذا القسم حالياً." : "No articles in this category currently."}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Standard Flex Sections layout */
          <>
            {activeSections.map((sec) => renderSection(sec))}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function HomepageWrapper() {
  return (
    <Suspense fallback={null}>
      <HomepageContent />
    </Suspense>
  );
}
