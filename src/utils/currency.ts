/**
 * Formats a numeric price into a localized string with the correct currency symbol.
 * Maps standard ISO currency codes to localized symbols in Arabic/English.
 */
export function formatPrice(price: number, currencyCode?: string, lang: "ar" | "en" = "ar"): string {
  const currency = currencyCode || "USD";
  
  if (lang === "ar") {
    const symbolMap: Record<string, string> = {
      USD: "$",
      EGP: "ج.م",
      SAR: "ر.س",
      AED: "د.إ",
      EUR: "يورو",
    };
    const symbol = symbolMap[currency] || currency;
    return `${price.toFixed(2)} ${symbol}`;
  } else {
    const symbolMap: Record<string, string> = {
      USD: "$",
      EGP: "EGP",
      SAR: "SAR",
      AED: "AED",
      EUR: "€",
    };
    const symbol = symbolMap[currency] || currency;
    if (symbol === "$" || symbol === "€") {
      return `${symbol}${price.toFixed(2)}`;
    }
    return `${price.toFixed(2)} ${symbol}`;
  }
}
