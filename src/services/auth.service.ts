import { AuthPayload, UserProfile } from "@/types";
import { getResponseData, isObject, requestJson } from "./client";

export function normalizePhone(rawPhone: string): string {
  const arabicDigitsMap: Record<string, string> = {
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
  };

  return rawPhone
    .split("")
    .map((char) => arabicDigitsMap[char] ?? char)
    .join("")
    .replace(/\D/g, "");
}

export function buildCustomerAuthFields(rawPhone: string, orgId?: string) {
  const normalizedPhone = normalizePhone(rawPhone);
  const orgSuffix =
    orgId && orgId.length > 6 ? orgId.slice(-6) : orgId || "";
  const username = orgSuffix
    ? `u_${orgSuffix}_${normalizedPhone}`
    : `u${normalizedPhone}`;
  const email = `${username}@shop.com`;
  return { normalizedPhone, username, email };
}

export const authService = {
  buildCustomerAuthFields,

  getStoredToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("domancy_token");
  },

  setStoredToken: (token: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("domancy_token", token);
  },

  clearStoredToken: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("domancy_token");
  },

  login: async (
    emailOrUsername: string,
    password: string,
    organizationId?: string
  ): Promise<AuthPayload> => {
    const payload = await requestJson("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        emailOrUsername,
        password,
        ...(organizationId ? { organizationId } : {}),
      }),
    });
    const data = getResponseData(payload);
    const user = isObject(data?.user) ? data.user : data;
    const token = data?.token || user?.token;
    if (!token) throw new Error("Token missing in login response");
    return { user, token };
  },

  loginByOrg: async (
    orgName: string,
    emailOrUsername: string,
    password: string
  ): Promise<AuthPayload> => {
    const payload = await requestJson(`/auth/${orgName}/login`, {
      method: "POST",
      body: JSON.stringify({ emailOrUsername, password }),
    });
    const data = getResponseData(payload);
    const user = isObject(data?.user) ? data.user : data;
    const token = data?.token || user?.token;
    if (!token) throw new Error("Token missing in login response");
    return { user, token };
  },

  signupCustomer: async (args: {
    name: string;
    phone: string;
    password: string;
    organizationId?: string;
  }) => {
    const { normalizedPhone, username, email } = buildCustomerAuthFields(
      args.phone,
      args.organizationId
    );
    const payload = await requestJson("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        name: args.name,
        username,
        email,
        phone: normalizedPhone,
        password: args.password,
        role: "customer",
        roles: ["customer"],
        ...(args.organizationId ? { organizationId: args.organizationId } : {}),
      }),
    });
    return getResponseData(payload);
  },

  loginByPhone: async (args: {
    phone: string;
    password: string;
    organizationId?: string;
  }): Promise<AuthPayload> => {
    const normalizedPhone = normalizePhone(args.phone);
    return authService.login(
      normalizedPhone,
      args.password,
      args.organizationId
    );
  },

  getMyProfile: async (token: string): Promise<UserProfile> => {
    const payload = await requestJson("/profiles/me", {
      method: "GET",
      token,
    });
    return getResponseData(payload) || {};
  },

  updateMyProfile: async (
    profile: UserProfile,
    token: string
  ): Promise<UserProfile> => {
    const body: Record<string, any> = {
      name: profile.name || profile.username,
      username: profile.username,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      bio: profile.bio,
      website: profile.website,
      socialLinks: profile.socialLinks,
      countryId: profile.countryId,
      governorateId: profile.governorateId,
      cityId: profile.cityId,
    };

    if (
      profile.location &&
      typeof profile.location.latitude === "number" &&
      typeof profile.location.longitude === "number"
    ) {
      body.location = {
        latitude: profile.location.latitude,
        longitude: profile.location.longitude,
      };
    }

    Object.keys(body).forEach((key) => {
      if (body[key] == null) delete body[key];
    });

    const payload = await requestJson("/profiles/me", {
      method: "PUT",
      token,
      body: JSON.stringify(body),
    });
    return getResponseData(payload) || {};
  },
};

