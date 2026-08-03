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

export interface Product {
  id: string;
  name: string | LocalizedString;
  price: number;
  oldPrice?: number;
  unit?: string;
  discount?: number;
  priceOptions?: ProductPriceOption[];
  minPrice?: number;
  maxPrice?: number;
  hasMultipleSizes?: boolean;
  imageUrl?: string;
  imageUrls?: string[];
  isActive?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  isJoker?: boolean;
  isSuperJoker?: boolean;
  categoryId?: string;
  organizationId?: string;
  additionalData?: {
    description?: string;
    detailedDescription?: string;
    isDetailedDescriptionHtml?: boolean;
    usage?: string;
    benefits?: string[];
    ingredients?: string[];
    selectedPriceOptionKey?: string;
    selectedSize?: string;
    selectedColor?: string;
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
export type DisplayMode = 'horizontal_list' | 'horizontal' | 'grid' | 'slider';
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
  showButton?: boolean;
  buttonText?: string | Record<string, string>;
  buttonLink?: string;
  buttonBg?: string;
  buttonTextColor?: string;
  useGradientTitle?: boolean;
  showHeroImage?: boolean;
  heroImageUrl?: string;
  showPrice?: boolean;
  price?: number;
  originalPrice?: number;
  discountLabel?: string;
}

export interface WebsiteSection {
  id: string;
  type: string;
  displayMode?: DisplayMode;
  title?: string;
  subtitle?: string;
  isActive?: boolean;
  config?: {
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
    buttonText?: string;
    buttonLink?: string;
    backgroundColor?: string;
    margin?: number;
    fullScreen?: boolean;
    imageCount?: number;
    imageUrl?: string;
    linkUrl?: string;
    variant?: string;
    postSlug?: string;
    imagePosition?: 'left' | 'right' | 'full';
    items?: any[];
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
  logoStyle?: LogoStyle;
  navbarOrder?: string[];
  sections?: WebsiteSection[];
  orderSettings?: OrderSettings;
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
}

export interface OrderItemData {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
