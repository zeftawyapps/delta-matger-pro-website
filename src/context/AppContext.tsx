"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "../services/api";
import clientConfig from "../config/clientConfig.json";
import { applyTheme } from "../utils/theme";
import { getCartLineKey } from "../utils/productPriceOptions";
import { initCampaignTracker } from "../utils/campaignTracker";
import {
  OrgConfig,
  BlogCategory,
  BlogPost,
  Product,
  Offer,
  UserProfile,
  AuthUser,
  OrganizationPolicy,
} from "../types";

export interface CartItem {
  product: Product;
  quantity: number;
}

export type AppMode = "blog" | "store" | "hybrid";

// Translations structure
export interface TranslationSet {
  appName: string;
  tagline: string;
  blog: string;
  store: string;
  hybrid: string;
  home: string;
  searchPlaceholder: string;
  searchBtn: string;
  login: string;
  logout: string;
  welcome: string;
  email: string;
  password: string;
  submit: string;
  close: string;
  dark: string;
  light: string;
  langCode: string;
  langName: string;
  cart: string;
  cartEmpty: string;
  addToCart: string;
  addedToCart: string;
  removeFromCart: string;
  checkout: string;
  total: string;
  categories: string;
  quickLinks: string;
  contactUs: string;
  slogan: string;
  copyright: string;
  readMore: string;
  minsRead: string;
  author: string;
  published: string;
  relatedPosts: string;
  comments: string;
  addComment: string;
  writeComment: string;
  postComment: string;
  price: string;
  qty: string;
  specifications: string;
  reviews: string;
  description: string;
  selectColor: string;
  selectSize: string;
  faqTitle: string;
  testimonialsTitle: string;
  featuredProducts: string;
  latestArticles: string;
  trending: string;
  newsletterTitle: string;
  newsletterSubtitle: string;
  subscribe: string;
  emailPlaceholder: string;
  successNewsletter: string;
  trustTitle: string;
  trustShipping: string;
  trustShippingSub: string;
  trustSupport: string;
  trustSupportSub: string;
  trustSecurity: string;
  trustSecuritySub: string;
  popularCategories: string;
  specName: string;
  specValue: string;
  size: string;
  color: string;
  all: string;
  itemCount: string;
  noResults: string;
  bothResults: string;
  viewDetails: string;
  chooseTemplate: string;
  chooseTemplateSub: string;
  exploreBlog: string;
  exploreBlogSub: string;
  exploreStore: string;
  exploreStoreSub: string;
  exploreHybrid: string;
  exploreHybridSub: string;
  enterSite: string;
  metaTitle: string;
  metaDesc: string;
  username: string;
  loginError: string;
  loginSuccess: string;
  commentNamePlaceholder: string;
  commentSuccess: string;
  settings: string;
  activeLayoutMode: string;
  blogOnly: string;
  storeOnly: string;
}

export const translations: Record<string, TranslationSet> = {
  en: {
    appName: "MatgerPro",
    tagline: "Your Premium Hub for Store & Blog",
    blog: "Blog",
    store: "Store",
    hybrid: "Hybrid",
    home: "Home",
    searchPlaceholder: "Search posts and products...",
    searchBtn: "Search",
    login: "Log In",
    logout: "Log Out",
    welcome: "Welcome back!",
    email: "Email Address",
    password: "Password",
    submit: "Submit",
    close: "Close",
    dark: "Dark",
    light: "Light",
    langCode: "en",
    langName: "English",
    cart: "Cart",
    cartEmpty: "Your cart is empty",
    addToCart: "Add to Cart",
    addedToCart: "Added!",
    removeFromCart: "Remove",
    checkout: "Checkout",
    total: "Total",
    categories: "Categories",
    quickLinks: "Quick Links",
    contactUs: "Contact Us",
    slogan: "Delivering state-of-the-art experiences in content and e-commerce.",
    copyright: "© 2026 MatgerPro. All rights reserved.",
    readMore: "Read More",
    minsRead: "min read",
    author: "Author",
    published: "Published",
    relatedPosts: "Related Articles",
    comments: "Comments",
    addComment: "Add a Comment",
    writeComment: "Write your comment here...",
    postComment: "Post Comment",
    price: "Price",
    qty: "Qty",
    specifications: "Specifications",
    reviews: "Reviews",
    description: "Description",
    selectColor: "Select Color",
    selectSize: "Select Size",
    faqTitle: "Frequently Asked Questions",
    testimonialsTitle: "What Our Clients Say",
    featuredProducts: "Featured Products",
    latestArticles: "Latest Blog Posts",
    trending: "Trending",
    newsletterTitle: "Subscribe to Our Newsletter",
    newsletterSubtitle: "Stay updated with the latest trends, products, and articles.",
    subscribe: "Subscribe",
    emailPlaceholder: "Enter your email...",
    successNewsletter: "Thank you for subscribing!",
    trustTitle: "Why Choose Us",
    trustShipping: "Free Delivery",
    trustShippingSub: "On orders over $50",
    trustSupport: "24/7 Support",
    trustSupportSub: "Dedicated helpline",
    trustSecurity: "100% Secure",
    trustSecuritySub: "SSL encryption payments",
    popularCategories: "Popular Collections",
    specName: "Feature",
    specValue: "Detail",
    size: "Size",
    color: "Color",
    all: "All",
    itemCount: "items",
    noResults: "No results found for",
    bothResults: "Found {p} products and {a} articles",
    viewDetails: "View Details",
    chooseTemplate: "Choose Website Template",
    chooseTemplateSub: "Select one of the designs below to explore the site's layout options.",
    exploreBlog: "Explore Blog",
    exploreBlogSub: "A beautiful reading layout with sliders, grids, categories, and typography-rich article pages.",
    exploreStore: "Explore Store",
    exploreStoreSub: "A complete shopping dashboard featuring slider banners, category grids, rating stars, and interactive product details.",
    exploreHybrid: "Explore Hybrid",
    exploreHybridSub: "A unified system that presents blog posts alongside e-commerce items with a global search.",
    enterSite: "Enter Template",
    metaTitle: "MatgerPro - Multi-template Blog & Store App",
    metaDesc: "High-performance Next.js application showing premium blog layouts, store grids, and hybrid models with native dark mode.",
    username: "Username / Email",
    loginError: "Please enter valid credentials.",
    loginSuccess: "Logged in successfully!",
    commentNamePlaceholder: "Your Name",
    commentSuccess: "Comment added successfully!",
    settings: "Settings",
    activeLayoutMode: "Active View Mode",
    blogOnly: "Blog Only",
    storeOnly: "Store Only",
  },
  ar: {
    appName: "متجر برو",
    tagline: "منصتك المميزة للمدونة والمتجر الرقمي",
    blog: "المدونة",
    store: "المتجر",
    hybrid: "النموذج الهجين",
    home: "الرئيسية",
    searchPlaceholder: "ابحث عن المقالات والمنتجات...",
    searchBtn: "بحث",
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    welcome: "مرحباً بك مجدداً!",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    submit: "إرسال",
    close: "إغلاق",
    dark: "داكن",
    light: "فاتح",
    langCode: "ar",
    langName: "العربية",
    cart: "السلة",
    cartEmpty: "سلة المشتريات فارغة",
    addToCart: "أضف إلى السلة",
    addedToCart: "تمت الإضافة!",
    removeFromCart: "حذف",
    checkout: "الدفع والطلب",
    total: "الإجمالي",
    categories: "الأقسام",
    quickLinks: "روابط سريعة",
    contactUs: "اتصل بنا",
    slogan: "نقدم تجارب رقمية متطورة تجمع بين صناعة المحتوى والتجارة الإلكترونية الفريدة.",
    copyright: "© 2026 متجر برو. جميع الحقوق محفوظة.",
    readMore: "اقرأ المزيد",
    minsRead: "دقائق القراءة",
    author: "الكاتب",
    published: "تاريخ النشر",
    relatedPosts: "مقالات ذات صلة",
    comments: "التعليقات",
    addComment: "إضافة تعليق",
    writeComment: "اكتب تعليقك هنا...",
    postComment: "نشر التعليق",
    price: "السعر",
    qty: "الكمية",
    specifications: "المواصفات",
    reviews: "التقييمات",
    description: "الوصف",
    selectColor: "اختر اللون",
    selectSize: "اختر المقاس",
    faqTitle: "الأسئلة الشائعة",
    testimonialsTitle: "ماذا يقول عملاؤنا",
    featuredProducts: "المنتجات المميزة",
    latestArticles: "آخر مقالات المدونة",
    trending: "شائع الآن",
    newsletterTitle: "اشترك في نشرتنا الإخبارية",
    newsletterSubtitle: "كن على اطلاع دائم بأحدث الاتجاهات والمنتجات والمقالات الحصرية.",
    subscribe: "اشتراك",
    emailPlaceholder: "أدخل بريدك الإلكتروني...",
    successNewsletter: "شكراً لاشتراكك معنا!",
    trustTitle: "لماذا تختارنا",
    trustShipping: "شحن مجاني",
    trustShippingSub: "للطلبات الأكثر من 50 دولار",
    trustSupport: "دعم 24/7",
    trustSupportSub: "خط مساعدة مخصص لخدمتك",
    trustSecurity: "دفع آمن 100%",
    trustSecuritySub: "تشفير SSL لحماية بياناتك",
    popularCategories: "التصنيفات الشائعة",
    specName: "الميزة",
    specValue: "التفاصيل",
    size: "المقاس",
    color: "اللون",
    all: "الكل",
    itemCount: "منتجات",
    noResults: "لا توجد نتائج بحث عن",
    bothResults: "تم العثور على {p} منتج و {a} مقال",
    viewDetails: "عرض التفاصيل",
    chooseTemplate: "اختر نموذج موقع الويب",
    chooseTemplateSub: "حدد أحد التصاميم أدناه لاستكشاف خيارات تخطيط الموقع.",
    exploreBlog: "استكشف المدونة",
    exploreBlogSub: "تخطيط قراءة جميل مع شرائح تفاعلية وقوائم وتصنيفات وصفحات مقالات غنية بالتنسيق البصري.",
    exploreStore: "استكشف المتجر",
    exploreStoreSub: "لوحة تحكم تسوق متكاملة تتميز ببنرات العروض المذهلة وشبكات التصنيفات وتفاصيل المنتجات التفاعلية.",
    exploreHybrid: "استكشف النموذج الهجين",
    exploreHybridSub: "نظام موحد يعرض مقالات المدونة جنباً إلى جنب مع منتجات المتجر مع بحث متقاطع شامل.",
    enterSite: "دخول النموذج",
    metaTitle: "متجر برو - تطبيق متعدد النماذج (متجر ومدونة)",
    metaDesc: "تطبيق Next.js متطور يقدم تصاميم ممتازة للمدونات والمتاجر الإلكترونية مع مظهر داكن مدمج ودعم كامل للعربية.",
    username: "اسم المستخدم / البريد",
    loginError: "يرجى إدخال بيانات صحيحة.",
    loginSuccess: "تم تسجيل الدخول بنجاح!",
    commentNamePlaceholder: "الاسم",
    commentSuccess: "تمت إضافة تعليقك بنجاح!",
    settings: "الإعدادات",
    activeLayoutMode: "نمط العرض الفعال",
    blogOnly: "مدونة فقط",
    storeOnly: "متجر فقط",
  }
};

interface AppContextType {
  config: OrgConfig | null;
  categories: BlogCategory[];
  productCategories: any[];
  posts: BlogPost[];
  products: Product[];
  offers: Offer[];
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (cartLineKey: string) => void;
  updateCartQuantity: (cartLineKey: string, quantity: number) => void;
  clearCart: () => void;
  loading: boolean;
  lang: "ar" | "en";
  changeLanguage: (newLang: string) => void;
  theme: string;
  toggleTheme: () => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  appTitle: string;
  footerPages: BlogPost[];
  navPages: BlogPost[];
  authToken: string | null;
  currentUser: AuthUser | null;
  profile: UserProfile | null;
  organizationPolicy: OrganizationPolicy | null;
  loginWithCredentials: (emailOrUsername: string, password: string) => Promise<void>;
  loginWithPhone: (phone: string, name?: string) => Promise<void>;
  signupWithPhone: (name: string, phone: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (profileInput: UserProfile) => Promise<void>;
  t: TranslationSet;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// TODO (Refactor): Split this Provider into dedicated Blocs/Providers per feature (e.g., AuthProvider, CartProvider, StoreProvider, BlogProvider)
export function AppContextProvider({ children }: { children: ReactNode }) {
  // TODO (Refactor): Move config, loading, theme & lang to ConfigBloc / ConfigProvider
  const [config, setConfig] = useState<OrgConfig | null>(null);
  // TODO (Refactor): Move blog categories and posts to BlogBloc / BlogProvider
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  // TODO (Refactor): Move product categories, products and offers to StoreBloc / StoreProvider
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  // TODO (Refactor): Move cart to CartBloc / CartProvider
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  // TODO (Refactor): Move auth state (tokens, profile, policies, user) to AuthBloc / AuthProvider
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organizationPolicy, setOrganizationPolicy] = useState<OrganizationPolicy | null>(null);

  const [theme, setTheme] = useState<string>("light");
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [appMode, setAppModeState] = useState<AppMode>("blog");

  // PERSISTENCE OF LAYOUT PREFERENCES
  const setAppMode = (mode: AppMode) => {
    setAppModeState(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("appMode", mode);
    }
  };

  // Load Setup Data on Mount
  useEffect(() => {
    async function loadData() {
      // Capture and track any campaign attribution parameters immediately
      initCampaignTracker(clientConfig.baseUrl);

      setLoading(true);
      try {
        const savedTheme = localStorage.getItem("theme");
        const savedLang = localStorage.getItem("lang") as "ar" | "en" | null;
        const savedMode = localStorage.getItem("appMode") as AppMode | null;

        if (savedTheme) {
          setTheme(savedTheme);
          document.documentElement.setAttribute("data-theme", savedTheme);
        } else {
          const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          const initialTheme = isSystemDark ? "dark" : "light";
          setTheme(initialTheme);
          document.documentElement.setAttribute("data-theme", initialTheme);
        }

        if (savedLang) {
          setLang(savedLang);
        }

        if (savedMode) {
          setAppModeState(savedMode);
        }

        const existingToken = api.getStoredToken();
        setAuthToken(existingToken);

        const orgConfig = await api.getConfig(clientConfig.defaultOrgName);
        setConfig({
          appVersion: clientConfig.appVersion,
          appBuildIndex: clientConfig.appBuildIndex,
          ...orgConfig,
        });

        // appMode priority: config.website.appMode > localStorage > "blog"
        const configMode = (orgConfig.website?.appMode as AppMode) ?? null;
        const initialMode = configMode ?? savedMode ?? "blog";
        setAppModeState(initialMode);

        const orgId = orgConfig.id || clientConfig.defaultOrgName;
        const [
          categoriesList,
          productCategoriesList,
          postsList,
          productsList,
          offersList,
          profileData,
          policyData,
        ] = await Promise.all([
          api.getCategories(orgId),
          api.getProductCategories(orgId),
          api.getPosts(orgId),
          api.getProducts(orgId),
          api.getOffers(orgId),
          existingToken ? api.getMyProfile(existingToken).catch(() => null) : Promise.resolve(null),
          api.getOrganizationPolicy(orgId, existingToken || undefined).catch(() => null),
        ]);

        setCategories(categoriesList.filter((c) => c.isActive));
        setProductCategories(productCategoriesList.filter((c) => c.isActive));
        setPosts(postsList.filter((p) => p.isActive));
        setProducts(productsList.filter((p) => p.isActive));
        setOffers(offersList.filter((o) => o.isActive));
        setProfile(profileData);
        setOrganizationPolicy(policyData);

        if (existingToken) {
          if (profileData) {
            setCurrentUser({
              id: profileData.id || "",
              username: profileData.username,
              email: profileData.email,
              phone: profileData.phone,
              name: profileData.name || profileData.username || profileData.phone || "",
            });
          } else {
            // Token is invalid / expired: clear it from client storage
            api.clearStoredToken();
            setAuthToken(null);
          }
        }
      } catch (err) {
        console.error("Error loading setup data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Load shopping cart from localStorage under "domancy_cart"
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("domancy_cart");
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error("Failed to parse cart data", e);
        }
      }
    }
  }, []);

  // Save Cart to storage
  const saveCartToStorage = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    if (typeof window !== "undefined") {
      localStorage.setItem("domancy_cart", JSON.stringify(updatedCart));
    }
  };

  // TODO (Refactor): Move cart operations (addToCart, removeFromCart, updateCartQuantity, clearCart) to CartBloc / CartProvider
  const addToCart = (product: Product, quantity = 1) => {
    const lineKey = getCartLineKey(product);
    const existingIndex = cart.findIndex((item) => getCartLineKey(item.product) === lineKey);
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += quantity;
      saveCartToStorage(updatedCart);
    } else {
      saveCartToStorage([...cart, { product, quantity }]);
    }
  };

  const removeFromCart = (cartLineKey: string) => {
    saveCartToStorage(cart.filter((item) => getCartLineKey(item.product) !== cartLineKey));
  };

  const updateCartQuantity = (cartLineKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartLineKey);
      return;
    }
    const updatedCart = cart.map((item) =>
      getCartLineKey(item.product) === cartLineKey ? { ...item, quantity } : item
    );
    saveCartToStorage(updatedCart);
  };

  const clearCart = () => {
    saveCartToStorage([]);
  };

  // Toggle Theme
  // TODO (Refactor): Move layout/theme toggling (toggleTheme, changeLanguage) to ConfigBloc / ConfigProvider
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.setAttribute("content", newTheme);
  };

  // Language management
  const changeLanguage = (newLang: string) => {
    const checkedLang = newLang === "en" ? "en" : "ar";
    setLang(checkedLang);
    localStorage.setItem("lang", checkedLang);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("lang", lang);
      document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    }
  }, [lang]);

  // Apply visual colors on config themes change or theme toggling
  useEffect(() => {
    if (config?.themes) {
      applyTheme(config.themes, theme === "dark");
    }
  }, [config, theme]);

  // Auth Operations
  // TODO (Refactor): Move profile / auth operations (refreshProfile, loginWithCredentials, signup, logout) to AuthBloc / AuthProvider
  const refreshProfile = async () => {
    if (!authToken) return;
    const profileData = await api.getMyProfile(authToken);
    setProfile(profileData);
  };

  const updateProfile = async (profileInput: UserProfile) => {
    if (!authToken) throw new Error("User is not authenticated");
    const updatedProfile = await api.updateMyProfile(profileInput, authToken);
    setProfile(updatedProfile);
    if (updatedProfile) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              username: updatedProfile.username || prev.username,
              phone: updatedProfile.phone || prev.phone,
              name: updatedProfile.name || updatedProfile.username || updatedProfile.phone || prev.name,
            }
          : null
      );
    }
  };

  const loginWithCredentials = async (emailOrUsername: string, password: string) => {
    const auth = await api.login(emailOrUsername, password);
    api.setStoredToken(auth.token);
    setAuthToken(auth.token);
    setCurrentUser(auth.user);
    try {
      const profileData = await api.getMyProfile(auth.token);
      setProfile(profileData);
    } catch (error) {
      setProfile(null);
    }
    if (config?.id) {
      const policy = await api.getOrganizationPolicy(config.id, auth.token);
      setOrganizationPolicy(policy);
    }
  };

  const loginWithPhone = async (phone: string, name?: string) => {
    const auth = await api.quickLoginByPhone({
      phone,
      name,
      organizationId: config?.id,
    });
    api.setStoredToken(auth.token);
    setAuthToken(auth.token);
    setCurrentUser(auth.user);
    try {
      const profileData = await api.getMyProfile(auth.token);
      setProfile(profileData);
    } catch (error) {
      setProfile(null);
    }
    if (config?.id) {
      const policy = await api.getOrganizationPolicy(config.id, auth.token);
      setOrganizationPolicy(policy);
    }
  };

  const signupWithPhone = async (name: string, phone: string) => {
    await api.signupCustomer({
      name,
      phone,
      organizationId: config?.id,
    });
    await loginWithPhone(phone);
  };

  const logout = () => {
    api.clearStoredToken();
    setAuthToken(null);
    setCurrentUser(null);
    setProfile(null);
    setOrganizationPolicy(null);
  };

  const appTitle = config?.visual?.appTitle || config?.appBranding?.appTitle || "Domancy";
  const footerPages = posts.filter((p) => p.postType === "page" && p.showInFooter);
  const navPages = posts.filter((p) => p.postType === "page" && p.showInNavigation);

  const t = translations[lang] || translations.ar;

  return (
    <AppContext.Provider
      value={{
        config,
        categories,
        productCategories,
        posts,
        products,
        offers,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        loading,
        lang,
        changeLanguage,
        theme,
        toggleTheme,
        appMode,
        setAppMode,
        searchQuery,
        setSearchQuery,
        appTitle,
        footerPages,
        navPages,
        authToken,
        currentUser,
        profile,
        organizationPolicy,
        loginWithCredentials,
        loginWithPhone,
        signupWithPhone,
        logout,
        refreshProfile,
        updateProfile,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppContextProvider");
  }
  return context;
}
