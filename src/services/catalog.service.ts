import {
  OrgConfig,
  BlogCategory,
  BlogPost,
  Product,
  Offer,
  OrganizationPolicy,
} from "@/types";
import clientConfig from "@/config/clientConfig.json";
import { getCampaignAttribution } from "@/utils/campaignTracker";
import {
  FALLBACK_CONFIG,
  FALLBACK_CATEGORIES,
  FALLBACK_POSTS,
  FALLBACK_PRODUCTS,
} from "@/data/mocks/fallbacks";
import {
  getBaseUrl,
  getFullImageUrl,
  getResponseData,
  requestJson,
  shouldUseMockData,
  toBool,
} from "./client";
import { mapProductFromApi } from "./mappers/product.mapper";

async function fetchOrganizationProductsRaw(
  organizationId: string
): Promise<any[]> {
  const limit = 100;
  let page = 1;
  let totalPages = 1;
  const allProducts: any[] = [];

  while (page <= totalPages) {
    const response = await fetch(
      `${getBaseUrl()}/products/organization/${organizationId}?page=${page}&limit=${limit}`
    );
    if (!response.ok) throw new Error("Failed to fetch products");

    const resData = await response.json();
    const payload = resData.data;

    if (Array.isArray(payload)) {
      return payload;
    }

    const batch = Array.isArray(payload?.products) ? payload.products : [];
    if (page === 1 && typeof payload?.totalPages === "number") {
      totalPages = payload.totalPages;
    }

    allProducts.push(...batch);
    if (batch.length < limit) break;
    page += 1;
  }

  return allProducts;
}

export const catalogService = {
  shouldUseMockData,

  getOrganizationPolicy: async (
    organizationId: string,
    token?: string
  ): Promise<OrganizationPolicy | null> => {
    try {
      const payload = await requestJson(
        `/organization-policies/${organizationId}`,
        {
          method: "GET",
          token,
        }
      );
      return getResponseData(payload) || null;
    } catch (error) {
      console.warn("Failed to fetch organization policy", error);
      return null;
    }
  },

  updateOrganizationPolicy: async (
    organizationId: string,
    policy: OrganizationPolicy,
    token: string
  ) => {
    const payload = await requestJson(
      `/organization-policies/${organizationId}`,
      {
        method: "PUT",
        token,
        body: JSON.stringify(policy),
      }
    );
    return getResponseData(payload);
  },

  updateOrganizationPolicySection: async (
    organizationId: string,
    section: "logistics" | "shipping" | "salesRules",
    sectionData: Record<string, any>,
    token: string
  ) => {
    const payload = await requestJson(
      `/organization-policies/${organizationId}/${section}`,
      {
        method: "PUT",
        token,
        body: JSON.stringify(sectionData),
      }
    );
    return getResponseData(payload);
  },

  getConfig: async (
    orgName = clientConfig.defaultOrgName
  ): Promise<OrgConfig> => {
    try {
      const response = await fetch(
        `${getBaseUrl()}/organization-configs/name/${orgName}`
      );
      if (!response.ok) throw new Error("Failed to fetch config");
      const resData = await response.json();
      const configData = resData.data || {};
      const logoUrl = configData.visual?.logoUrl
        ? getFullImageUrl(configData.visual.logoUrl)
        : undefined;

      const socialMedia =
        configData.socialMedia || configData.website?.socialMedia;
      const footer = configData.footer || configData.website?.footer;

      return {
        ...FALLBACK_CONFIG,
        ...configData,
        socialMedia: socialMedia ?? FALLBACK_CONFIG.socialMedia,
        footer: footer ?? FALLBACK_CONFIG.footer,
        visual: {
          ...FALLBACK_CONFIG.visual,
          ...configData.visual,
          logoUrl: logoUrl ?? FALLBACK_CONFIG.visual.logoUrl,
        },
        themes: { ...FALLBACK_CONFIG.themes, ...configData.themes },
      } as OrgConfig;
    } catch (error) {
      console.warn(
        "Backend offline or error fetching config. Using static branding settings.",
        error
      );
      return FALLBACK_CONFIG;
    }
  },

  getCategories: async (organizationId: string): Promise<BlogCategory[]> => {
    try {
      const response = await fetch(
        `${getBaseUrl()}/blog/categories/organization/${organizationId}`
      );
      if (!response.ok) throw new Error("Failed to fetch categories");
      const resData = await response.json();
      const rawCategories =
        resData.data && resData.data.length > 0
          ? resData.data
          : shouldUseMockData()
          ? FALLBACK_CATEGORIES
          : [];
      return rawCategories.map((c: any) => ({
        ...c,
        id: c.id || c.blogCategoryId || c._id,
      }));
    } catch (error) {
      console.warn("Backend offline or error fetching categories.", error);
      return shouldUseMockData() ? FALLBACK_CATEGORIES : [];
    }
  },

  getPosts: async (organizationId: string): Promise<BlogPost[]> => {
    try {
      const response = await fetch(
        `${getBaseUrl()}/blog/posts/organization/${organizationId}`
      );
      if (!response.ok) throw new Error("Failed to fetch posts");
      const resData = await response.json();
      const rawPosts =
        resData.data && resData.data.length > 0
          ? resData.data
          : shouldUseMockData()
          ? FALLBACK_POSTS
          : [];
      return rawPosts.map((post: any) => ({
        ...post,
        id: post.id || post.blogPostId || post._id,
        isActive: toBool(post.isActive) || post.isActive == null,
        isJoker: [
          post.isJoker,
          post.isjoker,
          post.isJocker,
          post.isJockerPost,
          post.joker,
          post.jokerPost,
          post.is_joker,
          post.is_jocker,
          post.isJokerpost,
          post.isJoker_post,
          post.iskjoker,
          post.is_kjoker,
        ].some(toBool),
        imageUrl: post.imageUrl ? getFullImageUrl(post.imageUrl) : undefined,
        introImageUrl: post.introImageUrl
          ? getFullImageUrl(post.introImageUrl)
          : undefined,
      }));
    } catch (error) {
      console.warn("Backend offline or error fetching posts.", error);
      return shouldUseMockData() ? FALLBACK_POSTS : [];
    }
  },

  getProduct: async (productId: string): Promise<Product> => {
    try {
      const response = await fetch(`${getBaseUrl()}/products/${productId}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      const resData = await response.json();
      return mapProductFromApi(resData.data);
    } catch (error) {
      if (shouldUseMockData()) {
        return (
          FALLBACK_PRODUCTS[productId] || {
            id: productId,
            name: `Product (${productId})`,
            price: 99,
            unit: "pcs",
          }
        );
      }
      throw error;
    }
  },

  getProducts: async (organizationId: string): Promise<Product[]> => {
    try {
      const rawProducts = await fetchOrganizationProductsRaw(organizationId);
      if (rawProducts.length === 0) {
        return shouldUseMockData() ? Object.values(FALLBACK_PRODUCTS) : [];
      }
      return rawProducts.map((p) => mapProductFromApi(p));
    } catch (error) {
      console.warn("Backend offline or error fetching products.", error);
      return shouldUseMockData() ? Object.values(FALLBACK_PRODUCTS) : [];
    }
  },

  getProductCategories: async (organizationId: string): Promise<any[]> => {
    try {
      const response = await fetch(
        `${getBaseUrl()}/categories/organization/${organizationId}`
      );
      if (!response.ok) throw new Error("Failed to fetch product categories");
      const resData = await response.json();
      const rawCategories = resData.data || [];
      return rawCategories.map((c: any) => ({
        ...c,
        id: c.id || c.categoryId || c._id,
        imageUrl:
          c.imageUrl || c.image
            ? getFullImageUrl(c.imageUrl || c.image)
            : undefined,
        isActive: c.isActive !== false,
      }));
    } catch (error) {
      console.warn(
        "Backend offline or error fetching product categories.",
        error
      );
      return shouldUseMockData() ? FALLBACK_CATEGORIES : [];
    }
  },

  getOffers: async (organizationId: string): Promise<Offer[]> => {
    try {
      const response = await fetch(
        `${getBaseUrl()}/offers/organization/${organizationId}`
      );
      if (!response.ok) throw new Error("Failed to fetch offers");
      const resData = await response.json();
      const rawOffers =
        resData.data && resData.data.length > 0 ? resData.data : [];
      return rawOffers.map((o: any) => ({
        ...o,
        id: o.id || o.offerId || o._id,
        imageUrl: o.imageUrl ? getFullImageUrl(o.imageUrl) : undefined,
        isActive: o.isActive !== false,
      }));
    } catch (error) {
      console.warn(
        "Backend offline or error fetching offers. Using empty fallback.",
        error
      );
      return [];
    }
  },

  submitFeedback: async (
    organizationId: string,
    payload: { name: string; contact: string; type: string; message: string },
    token?: string
  ): Promise<any> => {
    const bodyPayload = {
      organizationId,
      type: payload.type || "suggestion",
      userName: payload.name || undefined,
      userEmail: payload.contact || undefined,
      comment: payload.message || "",
    };

    const payloadRes = await requestJson("/feedback/submit", {
      method: "POST",
      token,
      body: JSON.stringify(bodyPayload),
    });

    return getResponseData(payloadRes);
  },

  subscribeNewsletter: async (args: {
    organizationId: string;
    email: string;
    source?: string;
    lang?: string;
    token?: string;
  }): Promise<any> => {
    const campaignAttribution = getCampaignAttribution();
    const bodyPayload = {
      organizationId: args.organizationId,
      email: args.email.trim(),
      source: args.source || "footer_newsletter",
      campaignAttribution: campaignAttribution || undefined,
      lang: args.lang || "ar",
      subscribedAt: new Date().toISOString(),
    };

    try {
      const payloadRes = await requestJson("/newsletter/subscribe", {
        method: "POST",
        token: args.token,
        body: JSON.stringify(bodyPayload),
      });
      return getResponseData(payloadRes);
    } catch (err: any) {
      if (
        err?.message?.includes("404") ||
        err?.message?.includes("Not Found")
      ) {
        const fallbackRes = await requestJson("/feedback/submit", {
          method: "POST",
          token: args.token,
          body: JSON.stringify({
            organizationId: args.organizationId,
            type: "newsletter_subscription",
            userName: "Newsletter Subscriber",
            userEmail: args.email.trim(),
            comment: JSON.stringify(bodyPayload),
          }),
        });
        return getResponseData(fallbackRes);
      }
      throw err;
    }
  },
};
