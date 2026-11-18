import { authService } from "./auth.service";
import { ordersService } from "./orders.service";
import { locationsService } from "./locations.service";
import { catalogService } from "./catalog.service";

// Re-export client & URL helpers
export {
  getEnvUrls,
  getBaseUrl,
  getImageUrl,
  BASE_URL,
  IMAGE_URL,
  getFullImageUrl,
} from "./client";

// Re-export mappers & auth helpers
export { normalizeVariants, mapProductFromApi } from "./mappers/product.mapper";
export { normalizePhone, buildCustomerAuthFields } from "./auth.service";

// Re-export mock fallbacks
export {
  FALLBACK_CONFIG,
  FALLBACK_CATEGORIES,
  FALLBACK_POSTS,
  FALLBACK_PRODUCTS,
} from "@/data/mocks/fallbacks";

// Export domain services directly for modern imports
export { authService, ordersService, locationsService, catalogService };

// Unified backward-compatible API facade
export const api = {
  ...authService,
  ...ordersService,
  ...locationsService,
  ...catalogService,
};
