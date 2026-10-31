export interface LocalizedString {
  ar: string;
  en: string;
}

export interface BlogCategory {
  id: string;
  name: LocalizedString;
  organizationId: string;
  isActive: boolean;
}

export interface BlogPost {
  id: string;
  title: LocalizedString;
  slug: string;
  content: LocalizedString;
  postType: 'post' | 'page' | 'intro';
  blogCategoryId?: string;
  organizationId: string;
  relatedProducts: string[];
  linkedProductId?: string;
  ctaButtonText?: LocalizedString | string;
  ctaButtonLink?: string;
  ctaLinkTarget?: string;
  campaignId?: string;
  imageUrl?: string;
  isActive: boolean;
  coreKey?: string;
  seoTitle?: LocalizedString;
  seoDescription?: LocalizedString;
  seoKeywords: string[];
  isJoker: boolean;
  isFeatured: boolean;
  isMost?: boolean;
  createdAt?: string;
  introTitle?: LocalizedString;
  introDescription?: LocalizedString;
  introImageUrl?: string;
  showInFooter?: boolean;
  showInNavigation?: boolean;
}

export interface ProductPriceOption {
  quantity?: number;
  unit?: string;
  price: number;
  oldPrice?: number;
  isDefault?: boolean;
  sizeDisplay?: string | LocalizedString;
  customPrices?: Record<string, number>;
}

export interface ProductVariantOption {
  value: string | LocalizedString;
  imageUrls?: string[];
  priceModifier?: number;
}

export interface ProductVariant {
  name: string | LocalizedString;
  options: ProductVariantOption[];
}

export interface ProductAddon {
  id?: string;
  name: string | LocalizedString;
  price?: number;
  [key: string]: any;
}

export interface ProductOption {
  id?: string;
  name: string | LocalizedString;
  type?: string;
  values?: (string | LocalizedString)[];
  [key: string]: any;
}

export interface StoreCategory {
  id: string;
  name: string | LocalizedString;
  organizationId?: string;
  description?: string | LocalizedString;
  imageUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
  productCount?: number;
}

export interface Product {
  id: string;
  name: string | LocalizedString;
  description?: string | LocalizedString;
  price: number;
  oldPrice?: number;
  unit?: string;
  discount?: number;
  priceOptions?: ProductPriceOption[];
  variants?: ProductVariant[];
  addons?: ProductAddon[];
  options?: ProductOption[];
  minPrice?: number;
  maxPrice?: number;
  hasMultipleSizes?: boolean;
  imageUrl?: string;
  imageUrls?: string[];
  images?: string[];
  isActive?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  isJoker?: boolean;
  isSuperJoker?: boolean;
  categoryId?: string;
  organizationId?: string;
  additionalData?: {
    description?: string | LocalizedString;
    detailedDescription?: string | LocalizedString;
    isDetailedDescriptionHtml?: boolean | string;
    usage?: string | LocalizedString;
    benefits?: (string | LocalizedString)[];
    ingredients?: (string | LocalizedString)[];
    isInsideOffer?: boolean | string;
    selectedPriceOptionKey?: string;
    selectedSize?: string;
    selectedColor?: string;
    selectedVariants?: Record<string, string>;
    variants?: ProductVariant[];
    addons?: ProductAddon[];
    options?: ProductOption[];
    [key: string]: any;
  };
}

export interface OrgConfig {
  id: string;
  appBranding?: {
    appTitle: string;
    defaultOrgName: string;
  };
  visual: {
    logoUrl?: string;
    faviconUrl?: string;
    fontFamily?: string;
    appTitle?: string;
  };
  themes: {
    light: Record<string, string>;
    dark: Record<string, string>;
    website?: {
      headerBackground?: string;
      footerBackground?: string;
      footerText?: string;
      heroOverlay?: string;
    };
  };
  socialMedia?: {
    facebook?: string;
    telegram?: string;
    whatsapp?: string;
    instagram?: string;
  };
  footer?: {
    address?: string;
    email?: string;
    phone?: string;
    description?: string;
    trustBadge?: string;
    copyright?: string;
  };
  policies?: {
    privacyHtml?: string;
    returnHtml?: string;
  };
  appVersion?: string;
  appBuildIndex?: number;
  website?: WebsiteConfig;
}

export interface Offer {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  imageUrl?: string;
  targetType: 'product' | 'category';
  targetId: string;
  discountPercentage: number;
  isActive: boolean;
  isValid: boolean;
}

export type AppMode = 'blog' | 'store' | 'hybrid';
export type LogoStyle = 'solid' | 'gradient';
export type DisplayMode = 'horizontal_list' | 'horizontal' | 'grid' | 'slider' | 'slide' | 'list' | 'scroll';
export type IntroDisplayStyle =
  | 'apple_fullscreen'
  | 'minimal_glass'
  | 'full_split'
  | 'classic_centered';
export type BackgroundType = 'solid' | 'gradient';
export type IndicatorType = 'pills' | 'dots' | 'none';
export type IntroTextAlign = 'start' | 'center' | 'end';

export interface IntroSlideConfig {
  displayStyle?: IntroDisplayStyle;
  backgroundType?: BackgroundType;
  customBg?: string;
  textColor?: string;
  autoPlay?: boolean;
  duration?: number;
  slideAnimation?: 'fade' | 'slide' | 'zoom' | 'flip';
  indicatorType?: IndicatorType;
  /** Text block alignment: start = side by language, center, end */
  textAlign?: IntroTextAlign;
  /** Classic hero — optional chrome (defaults match legacy HeroSection / StoreHero) */
  showGlow?: boolean;
  showBadge?: boolean;
  badgeText?: string | Record<string, string>;
  badgeBg?: string;
  badgeTextColor?: string;
  /** Fallback decorative intro title & description when no slides exist */
  fallbackTitle?: string | Record<string, string>;
  fallbackDescription?: string | Record<string, string>;
  showButton?: boolean;
  buttonText?: string | Record<string, string>;
  buttonLink?: string;
  buttonBg?: string;
  buttonBackgroundType?: 'solid' | 'gradient';
  buttonTextColor?: string;
  buttonShape?: 'rounded_rect' | 'pill' | 'soft' | 'square' | string;
  showButtonArrow?: boolean;
  useGradientTitle?: boolean;
  showHeroImage?: boolean;
  heroImageUrl?: string;
  showPrice?: boolean;
  price?: number;
  originalPrice?: number;
  discountLabel?: string;
  /** Content source: 'auto' (mode-based), 'intro_posts' (blog intro posts), 'joker_products' (store joker products) */
  slideSource?: 'auto' | 'intro_posts' | 'joker_products' | 'posts' | 'products' | 'joker';
  contentSource?: 'auto' | 'intro_posts' | 'joker_products' | 'posts' | 'products' | 'joker';
}

export type ThemePreset = 'dark_tech' | 'clean_minimal' | 'luxury_gold' | 'vibrant_ecom';

export interface SectionBackgroundConfig {
  type?: 'theme_default' | 'solid' | 'gradient_linear' | 'mesh_glow' | 'subtle_tint' | 'contrast_break' | 'radial_spotlight';
  solidColor?: string;
  gradientColors?: [string, string] | [string, string, string];
  gradientAngle?: number;
  glowColor?: string;
  glowPosition?: 'top' | 'center' | 'bottom' | 'corners';
  hasPattern?: boolean;
  dividerTop?: 'none' | 'glow_line' | 'gradient_fade';
  dividerBottom?: 'none' | 'glow_line' | 'gradient_fade';
}

export interface SystemShowcaseHotspot {
  x: number;
  y: number;
  title?: string | LocalizedString;
  description?: string | LocalizedString;
  targetType?: 'product' | 'post' | 'custom_url';
  productId?: string;
  postSlug?: string;
  customUrl?: string;
}

export interface SystemShowcaseItem {
  id: string;
  tabLabel?: string | LocalizedString;
  label?: string | LocalizedString;
  imageUrl: string;
  description?: string | LocalizedString;
  targetType: 'product' | 'post' | 'custom_url';
  productId?: string;
  postSlug?: string;
  customUrl?: string;
  buttonText?: string | LocalizedString;
  actionButton?: {
    show: boolean;
    text: string | LocalizedString;
  };
  floatingBadge?: {
    show: boolean;
    type: 'price_tag' | 'reading_time' | 'verified';
    text?: string;
  };
  hotspots?: SystemShowcaseHotspot[];
}

export interface NavbarAdvancedConfig {
  layoutStyle?: 'floating_pill' | 'full_width_glass' | 'solid_classic';
  scrollBehavior?: 'sticky' | 'hide_on_scroll_down' | 'static';
  showCart?: boolean;
  showSearch?: boolean;
  showAuth?: boolean;
  showThemeToggle?: boolean;
  showLanguageSwitch?: boolean;
  primaryCta?: {
    show: boolean;
    text: string | LocalizedString;
    link: string;
    variant: 'solid' | 'gradient' | 'outline';
    gradientColors?: [string, string];
  };
  directWhatsApp?: {
    show: boolean;
    phoneNumber?: string;
    label?: string | LocalizedString;
  };
  menuStyle?: 'dropdown' | 'mega_menu' | 'sidebar_drawer';
}

export interface FooterAdvancedConfig {
  layout?: '4_columns' | '3_columns' | '5_columns' | 'minimal_centered';
  showNewsletter?: boolean;
  newsletterTitle?: string | LocalizedString;
  newsletterSubtitle?: string | LocalizedString;
  showTrustBadges?: boolean;
  paymentIcons?: ('mada' | 'visa' | 'mastercard' | 'apple_pay' | 'tamara' | 'tabby' | 'vodafone_cash' | 'instapay' | 'fawry')[];
  licenseInfo?: {
    showCommercialReg?: boolean;
    commercialRegNumber?: string;
    showIndustrialLicense?: boolean;
    industrialLicenseNumber?: string;
    showTaxNumber?: boolean;
    taxNumber?: string;
    trademarkName?: string;
    foundedYear?: string;
    maroofBadgeUrl?: string;
  };
  showPolicies?: boolean;
  showSocialMedia?: boolean;
  backgroundStyle?: 'dark_mesh' | 'glass_blur' | 'solid' | 'brand_tinted';
}

export interface WebsiteSection {
  id: string;
  type: string;
  displayMode?: DisplayMode | string;
  title?: string | LocalizedString;
  description?: string | LocalizedString;
  subtitle?: string | LocalizedString;
  isActive?: boolean;
  config?: {
    // Section background rhythm engine
    background?: SectionBackgroundConfig;
    boxedLayout?: boolean;
    hasShadow?: boolean;
    // intro_slides: separate configs per appMode
    introHybrid?: IntroSlideConfig;
    introBlog?: IntroSlideConfig;
    introStore?: IntroSlideConfig;
    // products / categories
    autoPlay?: boolean;
    crossAxisCount?: 2 | 3 | 4;
    // blog posts
    limit?: number;
    // banner / generic
    title?: string | LocalizedString;
    description?: string | LocalizedString;
    buttonText?: string | LocalizedString;
    buttonLink?: string;
    backgroundColor?: string;
    margin?: number;
    fullScreen?: boolean;
    imageCount?: number;
    imageUrl?: string;
    linkUrl?: string;
    variant?: string;
    postSlug?: string;
    imagePosition?: 'left' | 'right' | 'top' | 'bottom' | 'full';
    items?: any[];
    tabs?: any[];
    plans?: any[];
    screens?: SystemShowcaseItem[];
    steps?: any[];
    cards?: any[];
    industries?: any[];
    categories?: any[];
    [key: string]: any;
  };
}

export interface OrderSettings {
  workflowSlug?: string | null;
  allowDefaultWorkflow?: boolean;
  calculationMode?: number;
  orderMode?: string;
}

export interface WebsiteConfig {
  appMode?: AppMode;
  themePreset?: ThemePreset;
  logoStyle?: LogoStyle;
  navbarOrder?: string[];
  sections?: WebsiteSection[];
  orderSettings?: OrderSettings;
  navbarAdvanced?: NavbarAdvancedConfig;
  footerAdvanced?: FooterAdvancedConfig;
  footer?: {
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    trustBadge?: string;
    copyright?: string;
  };
  socialMedia?: {
    facebook?: string;
    telegram?: string;
    whatsapp?: string;
    instagram?: string;
  };
  excessLinksMode?: 'dropdown' | 'sidebar';
  navbarLinksStyle?: 'classic' | 'capsule' | 'glass';
  navbarLayout?: 'classic' | 'floating' | 'boxed';
  navbarTheme?: 'glass' | 'solid' | 'gradient' | 'accent' | 'custom';
  navbarSticky?: boolean;
  customNavbarBg?: string;
  navbarBg?: string;
  customNavbarTextColor?: string;
  navbarTextColor?: string;
  footerLayout?: 'classic' | 'floating' | 'boxed';
  footerTheme?: 'glass' | 'solid' | 'gradient' | 'accent';
  showStoreCategoriesInNavbar?: boolean;
  showBlogCategoriesInNavbar?: boolean;
  showStoreCategoriesInFooter?: boolean;
  showBlogCategoriesInFooter?: boolean;
}

export interface AuthUser {
  id: string;
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  role?: string;
  roles?: string[];
  organizationId?: string;
  token?: string;
}

export interface AuthPayload {
  user: AuthUser;
  token: string;
}

export interface UserProfile {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  address?: string;
  bio?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  location?: {
    latitude: number;
    longitude: number;
  };
  countryId?: string;
  governorateId?: string;
  cityId?: string;
}

export interface OrganizationPolicy {
  id?: string;
  logistics?: {
    allowedUnits?: string[];
    defaultUnit?: string;
    currency?: string;
    enableVat?: boolean;
    taxPercentage?: number;
    enableStockManagement?: boolean;
  };
  shipping?: {
    defaultFee?: number;
    freeShippingEnabled?: boolean;
    feesByGovernorate?: Record<string, number>;
  };
  salesRules?: {
    autoDiscount?: boolean;
    wholesaleDiscount?: number;
    agentDiscount?: number;
    invoiceSlices?: Array<{
      minAmount: number;
      discountAmount: number;
    }>;
  };
  appLinks?: {
    links?: Array<{
      title: string;
      url: string;
      displayLocation: string;
      textColor?: string;
      fontWeight?: string;
      isUnderlined?: boolean;
      linkType?: string;
      body?: string;
    }>;
  };
}

export interface OrderItemData {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
