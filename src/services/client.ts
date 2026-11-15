import clientConfig from "@/config/clientConfig.json";

export const getEnvUrls = () => {
  return {
    baseUrl: clientConfig.baseUrl,
    imageUrl: clientConfig.imageUrl,
  };
};

export const getBaseUrl = (): string => getEnvUrls().baseUrl;
export const getImageUrl = (): string => getEnvUrls().imageUrl;
export const BASE_URL = getBaseUrl();
export const IMAGE_URL = getImageUrl();

export const getFullImageUrl = (url?: string): string => {
  if (!url) return "";

  const cleanUrl = url.trim();
  if (!cleanUrl) return "";

  if (/^\d+$/.test(cleanUrl)) {
    return "";
  }

  if (
    cleanUrl.startsWith("http://") ||
    cleanUrl.startsWith("https://") ||
    cleanUrl.startsWith("//") ||
    cleanUrl.startsWith("data:") ||
    cleanUrl.startsWith("blob:")
  ) {
    return cleanUrl;
  }

  let relativePath = cleanUrl;
  if (relativePath.includes("/uploads/")) {
    const idx = relativePath.indexOf("/uploads/");
    relativePath = relativePath.substring(idx);
  }

  const formattedUrl = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  return `${getImageUrl()}${formattedUrl}`;
};

export function toBool(value: any): boolean {
  if (value === true) return true;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return false;
}

export function isObject(value: any): value is Record<string, any> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

export function getResponseData(payload: any): any {
  if (!isObject(payload)) return payload;
  if ("data" in payload) return payload.data;
  return payload;
}

export function shouldUseMockData(): boolean {
  if (
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_ENABLE_DEMO_MOCK_DATA === "true"
  ) {
    return true;
  }
  if ((clientConfig as any)?.enableDemoMockData === true) {
    return true;
  }
  return false;
}

export async function requestJson(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<any> {
  const { token, headers, ...rest } = options;
  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || (payload && payload.success === false)) {
    const message = payload?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

