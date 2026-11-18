"use client";

import React, { useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/services/api";
import clientConfig from "@/config/clientConfig.json";
import { applyTheme, DEFAULT_DESIGN_LANGUAGE } from "@/utils/theme";
import { initCampaignTracker } from "@/utils/campaignTracker";
import { translations, TranslationSet } from "@/constants/translations";
import {
  useCartStore,
  useAuthStore,
  useCatalogStore,
  useUIStore,
} from "@/stores";
import {
  OrgConfig,
  BlogCategory,
  BlogPost,
  Product,
  Offer,
  UserProfile,
  AuthUser,
  OrganizationPolicy,
  CartItem,
  AppMode,
} from "@/types";

export type { CartItem, AppMode, TranslationSet };
export { translations };

export function AppContextProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const config = useCatalogStore((s) => s.config);
  const setConfig = useCatalogStore((s) => s.setConfig);
  const setCategories = useCatalogStore((s) => s.setCategories);
  const setProductCategories = useCatalogStore((s) => s.setProductCategories);
  const setPosts = useCatalogStore((s) => s.setPosts);
  const setProducts = useCatalogStore((s) => s.setProducts);
  const setOffers = useCatalogStore((s) => s.setOffers);
  const setLoading = useCatalogStore((s) => s.setLoading);

  const setAuthToken = useAuthStore((s) => s.setAuthToken);
  const setCurrentUser = useAuthStore((s) => s.setCurrentUser);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setOrganizationPolicy = useAuthStore((s) => s.setOrganizationPolicy);

  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const lang = useUIStore((s) => s.lang);
  const setLang = useUIStore((s) => s.setLang);
  const setAppModeDirect = useUIStore((s) => s.setAppModeDirect);

  // Track campaign parameters whenever route changes
  useEffect(() => {
    initCampaignTracker(clientConfig.baseUrl);
  }, [pathname]);

  // Bootstrap setup data on mount
  useEffect(() => {
    async function loadData() {
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
          const isSystemDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches;
          const initialTheme = isSystemDark ? "dark" : "light";
          setTheme(initialTheme);
          document.documentElement.setAttribute("data-theme", initialTheme);
        }

        if (savedLang) {
          setLang(savedLang);
        } else {
          setLang("ar");
        }

        const existingToken = api.getStoredToken();
        setAuthToken(existingToken);

        const orgConfig = await api.getConfig(clientConfig.defaultOrgName);
        setConfig({
          appVersion: clientConfig.appVersion,
          appBuildIndex: clientConfig.appBuildIndex,
          ...orgConfig,
        });

        const configMode = (orgConfig.website?.appMode as AppMode) ?? null;
        const initialMode = configMode ?? savedMode ?? "blog";
        setAppModeDirect(initialMode);

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
          existingToken
            ? api.getMyProfile(existingToken).catch(() => null)
            : Promise.resolve(null),
          api
            .getOrganizationPolicy(orgId, existingToken || undefined)
            .catch(() => null),
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
              name:
                profileData.name ||
                profileData.username ||
                profileData.phone ||
                "",
            });
          } else {
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
  }, [
    setAppModeDirect,
    setAuthToken,
    setCategories,
    setConfig,
    setCurrentUser,
    setLang,
    setLoading,
    setOffers,
    setOrganizationPolicy,
    setPosts,
    setProductCategories,
    setProducts,
    setProfile,
    setTheme,
  ]);

  // Sync HTML lang and dir attributes
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("lang", lang);
      document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    }
  }, [lang]);

  // Apply dynamic theme CSS variables
  useEffect(() => {
    if (config?.themes) {
      applyTheme(
        config.themes,
        theme === "dark",
        config.website?.themePreset,
        config.website?.designLanguage || DEFAULT_DESIGN_LANGUAGE
      );
    }
  }, [config, theme]);

  return <>{children}</>;
}

/**
 * Unified hook backed by Zustand stores (`useCartStore`, `useAuthStore`,
 * `useCatalogStore`, `useUIStore`) for full backward compatibility.
 * New components can import specific Zustand stores directly for optimal selector performance.
 */
export function useApp() {
  const catalog = useCatalogStore();
  const cartState = useCartStore();
  const auth = useAuthStore();
  const ui = useUIStore();

  const appTitle =
    catalog.config?.layout?.appTitle ||
    catalog.config?.website?.appTitle ||
    catalog.config?.visual?.appTitle ||
    catalog.config?.appBranding?.appTitle ||
    "Domancy";

  const footerPages = catalog.posts.filter(
    (p) => p.postType === "page" && p.showInFooter
  );
  const navPages = catalog.posts.filter(
    (p) => p.postType === "page" && p.showInNavigation
  );

  const t = translations[ui.lang] || translations.ar;

  return {
    config: catalog.config,
    categories: catalog.categories,
    productCategories: catalog.productCategories,
    posts: catalog.posts,
    products: catalog.products,
    offers: catalog.offers,
    loading: catalog.loading,

    cart: cartState.cart,
    addToCart: cartState.addToCart,
    removeFromCart: cartState.removeFromCart,
    updateCartQuantity: cartState.updateCartQuantity,
    clearCart: cartState.clearCart,

    lang: ui.lang,
    changeLanguage: ui.changeLanguage,
    theme: ui.theme,
    toggleTheme: ui.toggleTheme,
    appMode: ui.appMode,
    setAppMode: ui.setAppMode,
    searchQuery: ui.searchQuery,
    setSearchQuery: ui.setSearchQuery,

    appTitle,
    footerPages,
    navPages,

    authToken: auth.authToken,
    currentUser: auth.currentUser,
    profile: auth.profile,
    organizationPolicy: auth.organizationPolicy,

    loginWithCredentials: (emailOrUsername: string, password: string) =>
      auth.loginWithCredentials(emailOrUsername, password, catalog.config?.id),
    loginWithPhone: (phone: string, password: string) =>
      auth.loginWithPhone(phone, password, catalog.config?.id),
    signupWithPhone: (name: string, phone: string, password: string) =>
      auth.signupWithPhone(name, phone, password, catalog.config?.id),
    logout: auth.logout,
    refreshProfile: auth.refreshProfile,
    updateProfile: auth.updateProfile,

    t,
  };
}
