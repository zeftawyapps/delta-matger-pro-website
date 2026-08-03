import {
  OrgConfig,
  BlogCategory,
  BlogPost,
  Product,
  Offer,
  AuthPayload,
  UserProfile,
  OrganizationPolicy,
  OrderItemData,
} from '../types';

import clientConfig from '../config/clientConfig.json';

// Base URL environment detection
export const getEnvUrls = () => {
  return {
    baseUrl: clientConfig.baseUrl,
    imageUrl: clientConfig.imageUrl
  };
};

export const getBaseUrl = (): string => getEnvUrls().baseUrl;
export const getImageUrl = (): string => getEnvUrls().imageUrl;
export const BASE_URL = getBaseUrl();
export const IMAGE_URL = getImageUrl();

export const getFullImageUrl = (url?: string): string => {
  if (!url) return '';

  let cleanUrl = url;
  if (cleanUrl.includes('/uploads/')) {
    const idx = cleanUrl.indexOf('/uploads/');
    cleanUrl = cleanUrl.substring(idx);
  }

  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }
  const formattedUrl = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
  return `${getImageUrl()}${formattedUrl}`;
};

function toBool(value: any): boolean {
  if (value === true) return true;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  }
  return false;
}

function isObject(value: any): value is Record<string, any> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function getResponseData(payload: any): any {
  if (!isObject(payload)) return payload;
  if ('data' in payload) return payload.data;
  return payload;
}

// TODO (Refactor): Move to core client / base network layer (datasources/api_client.ts)
async function requestJson(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<any> {
  const { token, headers, ...rest } = options;
  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  let payload: any = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok || (payload && payload.success === false)) {
    const message =
      payload?.message ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

// TODO (Refactor): Move to Repository Helper / Auth Utils (utils/auth_helper.ts)
export function normalizePhone(rawPhone: string): string {
  const arabicDigitsMap: Record<string, string> = {
    '٠': '0',
    '١': '1',
    '٢': '2',
    '٣': '3',
    '٤': '4',
    '٥': '5',
    '٦': '6',
    '٧': '7',
    '٨': '8',
    '٩': '9',
  };

  return rawPhone
    .split('')
    .map((char) => arabicDigitsMap[char] ?? char)
    .join('')
    .replace(/\D/g, '');
}

export function buildCustomerAuthFields(rawPhone: string) {
  const normalizedPhone = normalizePhone(rawPhone);
  const username = `u${normalizedPhone}`;
  const password = `U_s${normalizedPhone}`;
  const email = `${username}@shop.com`;
  return { normalizedPhone, username, password, email };
}

const ADDITIONAL_DATA_KEYS = [
  'description',
  'detailedDescription',
  'isDetailedDescriptionHtml',
  'usage',
  'benefits',
  'ingredients',
] as const;

// TODO (Refactor): Move to Product Mapper / Domain Layer (repositories/mappers/product_mapper.ts)
function buildAdditionalData(raw: Record<string, any>): Product['additionalData'] {
  const fromNested = raw.additionalData && typeof raw.additionalData === 'object'
    ? { ...raw.additionalData }
    : {};

  for (const key of ADDITIONAL_DATA_KEYS) {
    if (raw[key] != null && fromNested[key] == null) {
      fromNested[key] = raw[key];
    }
  }

  return Object.keys(fromNested).length > 0 ? fromNested : undefined;
}

// TODO (Refactor): Move to Product Mapper / Domain Layer (repositories/mappers/product_mapper.ts)
export function mapProductFromApi(raw: Record<string, any>): Product {
  const images = raw.images && Array.isArray(raw.images) && raw.images.length > 0
    ? raw.images
    : (raw.imageUrls && Array.isArray(raw.imageUrls) && raw.imageUrls.length > 0 ? raw.imageUrls : []);
  const productImage = images.length > 0
    ? getFullImageUrl(images[0])
    : (raw.image ? getFullImageUrl(raw.image) : undefined);
  const productImages = images.map((img: string) => getFullImageUrl(img));

  return {
    id: raw.id || raw.productId || raw._id,
    name: raw.name || '',
    price: raw.price ?? 0,
    oldPrice: raw.oldPrice,
    unit: raw.unit || 'pcs',
    discount: raw.discount,
    priceOptions: Array.isArray(raw.priceOptions) ? raw.priceOptions : undefined,
    minPrice: raw.minPrice,
    maxPrice: raw.maxPrice,
    hasMultipleSizes: raw.hasMultipleSizes,
    imageUrl: productImage,
    imageUrls: productImages,
    isActive: raw.isActive !== false,
    isNew: raw.isNew === true,
    isBestSeller: raw.isBestSeller === true,
    isOnSale: raw.isOnSale === true,
    isJoker: raw.isJoker === true,
    isSuperJoker: raw.isSuperJoker === true,
    categoryId: raw.categoryId || raw.category || '',
    organizationId: raw.organizationId || '',
    additionalData: buildAdditionalData(raw),
  };
}

async function fetchOrganizationProductsRaw(organizationId: string): Promise<any[]> {
  const limit = 100;
  let page = 1;
  let totalPages = 1;
  const allProducts: any[] = [];

  while (page <= totalPages) {
    const response = await fetch(
      `${getBaseUrl()}/products/organization/${organizationId}?page=${page}&limit=${limit}`
    );
    if (!response.ok) throw new Error('Failed to fetch products');

    const resData = await response.json();
    const payload = resData.data;

    if (Array.isArray(payload)) {
      return payload;
    }

    const batch = Array.isArray(payload?.products) ? payload.products : [];
    if (page === 1 && typeof payload?.totalPages === 'number') {
      totalPages = payload.totalPages;
    }

    allProducts.push(...batch);
    if (batch.length < limit) break;
    page += 1;
  }

  return allProducts;
}

// Basic static branding & content fallback in case backend is offline
export const FALLBACK_CONFIG: OrgConfig = {
  id: clientConfig.defaultOrgName || "deltastore",
  appBranding: {
    appTitle: clientConfig.appTitle || "Domancy",
    defaultOrgName: clientConfig.defaultOrgName || "deltastore"
  },
  visual: {
    logoUrl: clientConfig.logoUrl || "",
    faviconUrl: clientConfig.logoUrl || "",
    fontFamily: "Cairo"
  },
  themes: {
    light: {
      primary: "0xFFD4AF37",
      secondary: "0xFF1A2332",
      accent: "0xFFECC951",
      background: "0xFFFAF8F3",
      surface: "0xFFFFFFFF",
      surfaceVariant: "0xFFF5F0E8",
      textPrimary: "0xFF1A2332",
      textSecondary: "0xFF5A6779",
      textHint: "0xFF9CA3AF",
      textOnPrimary: "0xFFFFFFFF",
      buttonPrimary: "0xFFD4AF37",
      buttonSecondary: "0xFF1A2332",
      buttonText: "0xFFFFFFFF",
      divider: "0xFFE5DCC8",
      icon: "0xFFD4AF37",
      inputBackground: "0xFFFAF8F3",
      inputBorder: "0xFFD4C9B0",
      inputFocus: "0xFFD4AF37",
      herbGreen: "0xFF8FA883",
      success: "0xFF4CAF50",
      error: "0xFFE53935",
      warning: "0xFFFFB300",
      info: "0xFF2196F3"
    },
    dark: {
      primary: "0xFFD4AF37",
      secondary: "0xFFECC951",
      background: "0xFF1A2332",
      surface: "0xFF242F3F",
      surfaceVariant: "0xFF2D3847",
      textPrimary: "0xFFFAF8F3",
      textSecondary: "0xFFD4C9B0",
      textHint: "0xFF8A8574",
      textOnPrimary: "0xFF1A2332",
      buttonPrimary: "0xFFD4AF37",
      buttonSecondary: "0xFF2D3847",
      buttonText: "0xFF1A2332",
      divider: "0xFF3D4A5C",
      icon: "0xFFD4AF37",
      inputBackground: "0xFF242F3F",
      inputBorder: "0xFF3D4A5C",
      inputFocus: "0xFFD4AF37",
      herbGreen: "0xFF8FA883",
      success: "0xFF66BB6A",
      error: "0xFFEF5350",
      warning: "0xFFFFCA28",
      info: "0xFF42A5F5"
    },
    website: {
      headerBackground: '#FFFFFF',
      footerBackground: '#0F172A',
      footerText: '#FFFFFF',
      heroOverlay: 'rgba(79, 70, 229, 0.1)'
    }
  },
  socialMedia: {
    facebook: "https://facebook.com/domansy",
    telegram: "https://t.me/domansy",
    whatsapp: "+20100000000"
  },
  footer: {
    address: "العنوان: القاهرة، جمهورية مصر العربية",
    email: "support@domancy.com",
    phone: "+20 100 000 0000",
    description: "دومانسي - بوابتك للتسوق الذكي وتوفير كافة احتياجاتك بأفضل جودة وأسعار منافسة."
  },
  policies: {
    privacyHtml: `
      <div dir="rtl">
        <h1>سياسة الخصوصية</h1>
        <p>تاريخ آخر تحديث: <strong>مايو 2026</strong></p>
        
        <h2>1. جمع المعلومات</h2>
        <p>نحن نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند التسجيل في المتجر، مثل الاسم، رقم الهاتف، والبريد الإلكتروني، بالإضافة إلى معلومات التصفح الأساسية لتحسين تجربتك.</p>

        <h2>2. استخدام المعلومات</h2>
        <p>تُستخدم المعلومات التي نجمعها لـ:</p>
        <ul>
          <li>معالجة وتوصيل طلباتك بنجاح.</li>
          <li>تحسين جودة الخدمة وتقديم تجربة تسوق مخصصة.</li>
          <li>إرسال التحديثات والعروض الترويجية (في حال موافقتك).</li>
        </ul>

        <h2>3. حماية البيانات</h2>
        <p>نحن نتخذ كافة التدابير الأمنية المتقدمة لضمان حماية بياناتك الشخصية من الوصول غير المصرح به، التعديل، أو الإفشاء.</p>

        <h2>4. مشاركة البيانات</h2>
        <p>نحن لا نبيع أو نشارك بياناتك مع أطراف ثالثة لأغراض تسويقية. يتم مشاركة البيانات الأساسية فقط مع شركاء الشحن لتوصيل الطلبات.</p>

        <h2>5. التواصل معنا</h2>
        <p>إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا عبر وسائل الاتصال المتاحة في المتجر.</p>
      </div>
    `,
    returnHtml: `
      <div dir="rtl">
        <h1>سياسة الاسترجاع والاستبدال</h1>
        <p>تاريخ آخر تحديث: <strong>مايو 2026</strong></p>
        
        <h2>1. فترة الاسترجاع</h2>
        <p>يحق للعميل استرجاع أو استبدال المنتجات خلال <strong>14 يوماً</strong> من تاريخ الاستلام، بشرط أن يكون المنتج في حالته الأصلية وغير مستخدم.</p>

        <h2>2. شروط الاسترجاع</h2>
        <ul>
          <li>يجب أن يكون المنتج في عبوته الأصلية مع جميع الملحقات.</li>
          <li>المنتجات القابلة للتلف أو ذات الاستهلاك السريع (مثل بعض المواد الغذائية أو الآيس كريم) قد تخضع لشروط استرجاع خاصة.</li>
          <li>يجب إرفاق فاتورة الشراء الأصلية.</li>
        </ul>

        <h2>3. آلية الاسترجاع</h2>
        <p>تتم عملية الاسترجاع بالتواصل مع فريق خدمة العملاء لتحديد موعد استلام المندوب للمنتج. بعد فحص المنتج، يتم استرداد المبلغ إما نقداً أو كرصيد في حسابك.</p>

        <h2>4. المنتجات غير القابلة للاسترجاع</h2>
        <p>لا نقبل استرجاع المنتجات التي تم فتحها، أو استخدامها، أو تعرضت للتلف بسبب سوء الاستخدام من قبل العميل.</p>
      </div>
    `
  },
  website: {
    sections: [
      {
        id: "web_offers",
        type: "offers",
        displayMode: "slider",
        title: "أحدث العروض والخصومات",
        isActive: true,
        config: { autoPlay: true }
      },
      {
        id: "web_categories",
        type: "categories",
        displayMode: "horizontal_list",
        title: "تسوق حسب التصنيف",
        isActive: true,
        config: {}
      },
      {
        id: "web_new_products",
        type: "new_products",
        displayMode: "grid",
        title: "وصل حديثاً",
        isActive: true,
        config: { crossAxisCount: 4 }
      },
      {
        id: "web_best_sellers",
        type: "best_seller",
        displayMode: "grid",
        title: "الأكثر مبيعاً",
        isActive: true,
        config: { crossAxisCount: 4 }
      },
      {
        id: "web_blog_posts",
        type: "blog_posts",
        displayMode: "grid",
        title: "أحدث المقالات في المدونة",
        isActive: true,
        config: { limit: 3 }
      }
    ],
    orderSettings: {
      workflowSlug: null,
      allowDefaultWorkflow: true,
      calculationMode: 2,
      orderMode: "C2B"
    }
  }
};

// Fallback Mock Blog Data
export const FALLBACK_CATEGORIES: BlogCategory[] = [
  { id: "cat-1", name: { ar: "عام", en: "General" }, organizationId: "deltastore", isActive: true },
  { id: "cat-2", name: { ar: "أخبار المتجر", en: "Store News" }, organizationId: "deltastore", isActive: true },
  { id: "cat-3", name: { ar: "نصائح وإرشادات", en: "Tips & Guides" }, organizationId: "deltastore", isActive: true },
  { id: "cat-4", name: { ar: "جديدنا", en: "What's New" }, organizationId: "deltastore", isActive: true }
];

export const FALLBACK_POSTS: BlogPost[] = [
  {
    id: "page-privacy",
    title: { ar: "سياسة الخصوصية", en: "Privacy Policy" },
    slug: "privacy",
    content: {
      ar: `<h3>1. جمع البيانات</h3><p>نقوم بجمع بياناتك الأساسية لمعالجة الشحنات وتوصيل الطلبات بنجاح.</p><h3>2. حماية البيانات</h3><p>بياناتك محمية بتشفير SSL عالي الأمان لضمان عدم تسريبها لأي طرف ثالث.</p>`,
      en: `<h3>1. Data Collection</h3><p>We collect essential data to process your shipments and deliver your orders successfully.</p><h3>2. Data Security</h3><p>Your data is protected using secure SSL encryption to prevent unauthorized access.</p>`
    },
    postType: "page",
    organizationId: "deltastore",
    relatedProducts: [],
    isActive: true,
    showInFooter: true,
    showInNavigation: false,
    isJoker: false,
    isFeatured: false,
    seoKeywords: []
  },
  {
    id: "page-returns",
    title: { ar: "سياسة الاسترجاع", en: "Return Policy" },
    slug: "returns",
    content: {
      ar: `<p>يمكنك استرجاع أو استبدال المنتجات التالفة خلال 14 يوماً من استلام الطلب بشرط سلامة العبوة الأصلية وعدم فتح الأختام المصنعية.</p>`,
      en: `<p>You can return or exchange damaged products within 14 days of receipt, provided the original packaging and safety seals are intact.</p>`
    },
    postType: "page",
    organizationId: "deltastore",
    relatedProducts: [],
    isActive: true,
    showInFooter: true,
    showInNavigation: false,
    isJoker: false,
    isFeatured: false,
    seoKeywords: []
  },
  {
    id: "page-about",
    title: { ar: "من نحن", en: "About Us" },
    slug: "about",
    content: {
      ar: `<p>متجر برو هو منصة رائدة في تقديم أفضل المنتجات التكنولوجية والإلكترونية مع محتوى معرفي غني من خلال مدونتنا المتخصصة لمساعدتك في اتخاذ قرارات الشراء الأنسب.</p>`,
      en: `<p>MatgerPro is a leading platform providing top-tier tech items alongside rich informational content through our dedicated blog to help you make informed purchase decisions.</p>`
    },
    postType: "page",
    organizationId: "deltastore",
    relatedProducts: [],
    isActive: true,
    showInFooter: false,
    showInNavigation: true,
    isJoker: false,
    isFeatured: false,
    seoKeywords: []
  },
  {
    id: "post-1",
    title: { ar: "دليلك الشامل لاختيار سماعات الرأس اللاسلكية", en: "Complete Guide to Wireless Headphones" },
    slug: "wireless-headphones-guide",
    seoDescription: { ar: "نصائح لشراء سماعة رأس لاسلكية بميزة إلغاء الضجيج وعمر بطارية طويل.", en: "Key pointers to purchase the best noise-cancelling headphones." },
    content: {
      ar: "إن العثور على سماعة الرأس المثالية قد يكون تحدياً كبيراً نظراً لكتبة الخيارات المتاحة. في هذا الدليل، نغطي أهم المعايير التي يجب مراعاتها:\n\n1. جودة الصوت وإلغاء الضوضاء النشط (ANC).\n2. عمر البطارية وسرعة الشحن.\n3. راحة التصميم والوزن للاستخدام الطويل.\n\nتأكد من اختيار سماعة تدعم البلوتوث الحديث لتجنب تأخير الصوت.",
      en: "Finding the perfect headphones can be challenging with so many options. In this guide, we cover the primary parameters to watch for:\n\n1. Audio quality & Active Noise Cancellation (ANC).\n2. Battery life & fast charging.\n3. Fit comfort & build ergonomics for long hours.\n\nAlways opt for newer Bluetooth versions to prevent audio latency."
    },
    postType: "post",
    blogCategoryId: "cat-3",
    organizationId: "deltastore",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    isActive: true,
    isJoker: false,
    isFeatured: true,
    createdAt: "2026-06-20T10:00:00Z",
    relatedProducts: [],
    seoKeywords: []
  },
  {
    id: "post-2",
    title: { ar: "كيف تزيد من إنتاجيتك باستخدام شاشات العرض المتعددة", en: "Maximize Productivity with Dual Monitors" },
    slug: "dual-monitors-productivity",
    seoDescription: { ar: "فوائد استخدام شاشتين للعمل البرمجي والتصميم وإدارة المهام.", en: "Benefits of using multiple screens for programming, design, and work." },
    content: {
      ar: "تشير الدراسات إلى أن استخدام شاشة ثانوية يزيد الإنتاجية بنسبة تصل إلى 20-30%.\n\nمن خلال فصل مساحة العمل البرمجية عن نوافذ المحادثات والمتصفح، يمكنك تقليل التشتت والتركيز بشكل أعمق على الكود. ننصح بشاشات ذات دقة عالية لتجنب إجهاد العين.",
      en: "Studies show that a secondary monitor can enhance productivity by up to 20-30%.\n\nBy separating your core workspace from emails or messaging apps, you reduce context switching. We recommend high-resolution panels to prevent eye strain."
    },
    postType: "post",
    blogCategoryId: "cat-3",
    organizationId: "deltastore",
    imageUrl: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800",
    isActive: true,
    isJoker: false,
    isFeatured: false,
    createdAt: "2026-06-18T14:30:00Z",
    relatedProducts: [],
    seoKeywords: []
  },
  {
    id: "post-3",
    title: { ar: "مراجعة شاملة للابتوب الألعاب الأقوى هذا العام", en: "Top Gaming Laptop Review" },
    slug: "top-gaming-laptop-review",
    seoDescription: { ar: "مراجعة الأداء والمواصفات للابتوب الألعاب والرسومات الأحدث.", en: "In-depth hardware benchmark and gaming performance review." },
    content: {
      ar: "قمنا باختبار لابتوب الألعاب الأحدث هذا الأسبوع تحت ضغط تشغيل أعلى جرافيكس.\n\nالأداء مذهل بفضل كرت الشاشة RTX الحديث والمعالج ثماني النواة، لكن واجهتنا حرارة طفيفة عند اللعب المتواصل لأكثر من 3 ساعات. ننصح باستخدام قاعدة تبريد مخصصة لرفع الكفاءة.",
      en: "We stress-tested the latest gaming laptops this week under maximum visual loads.\n\nThe benchmark shows incredible frames thanks to the RTX card and octa-core processor, but we experienced minor heat throttling after 3 hours. A cooling pad is advised."
    },
    postType: "post",
    blogCategoryId: "cat-4",
    organizationId: "deltastore",
    imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
    isActive: true,
    isJoker: true,
    isFeatured: false,
    createdAt: "2026-06-22T08:00:00Z",
    relatedProducts: [],
    seoKeywords: []
  }
];

// Fallback products mock list
export const FALLBACK_PRODUCTS: Record<string, Product> = {

};

// API Services
// TODO (Refactor): Split this object into specific Domain Repositories (e.g. AuthRepository, StoreRepository, BlogRepository)
export const api = {
  buildCustomerAuthFields,

  // TODO (Refactor): Move to Local Auth Storage Source (datasources/local_auth_storage.ts)
  getStoredToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('domancy_token');
  },

  setStoredToken: (token: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('domancy_token', token);
  },

  clearStoredToken: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('domancy_token');
  },

  // TODO (Refactor): Move to Auth Repository (repositories/auth_repository.ts) / Auth Data Source (datasources/auth_datasource.ts)
  login: async (
    emailOrUsername: string,
    password: string
  ): Promise<AuthPayload> => {
    const payload = await requestJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername, password }),
    });
    const data = getResponseData(payload);
    const user = isObject(data?.user) ? data.user : data;
    const token = data?.token || user?.token;
    if (!token) throw new Error('Token missing in login response');
    return { user, token };
  },

  loginByOrg: async (
    orgName: string,
    emailOrUsername: string,
    password: string
  ): Promise<AuthPayload> => {
    const payload = await requestJson(`/auth/${orgName}/login`, {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername, password }),
    });
    const data = getResponseData(payload);
    const user = isObject(data?.user) ? data.user : data;
    const token = data?.token || user?.token;
    if (!token) throw new Error('Token missing in login response');
    return { user, token };
  },

  signupCustomer: async (args: {
    name: string;
    phone: string;
    organizationId?: string;
  }) => {
    const { normalizedPhone, username, password, email } =
      buildCustomerAuthFields(args.phone);
    const payload = await requestJson('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: args.name,
        username,
        email,
        phone: normalizedPhone,
        password,
        role: 'customer',
        roles: ['customer'],
        organizationId: args.organizationId,
      }),
    });
    return getResponseData(payload);
  },

  quickLoginByPhone: async (args: {
    phone: string;
    name?: string;
    organizationId?: string;
  }): Promise<AuthPayload> => {
    const { username, password } = buildCustomerAuthFields(args.phone);
    try {
      return await api.login(username, password);
    } catch (error) {
      await api.signupCustomer({
        name: args.name || `Customer ${normalizePhone(args.phone).slice(-4) || ''}`,
        phone: args.phone,
        organizationId: args.organizationId,
      });
      return api.login(username, password);
    }
  },

  // TODO (Refactor): Move to Profile Repository (repositories/profile_repository.ts) / Profile Data Source (datasources/profile_datasource.ts)
  getMyProfile: async (token: string): Promise<UserProfile> => {
    const payload = await requestJson('/profiles/me', {
      method: 'GET',
      token,
    });
    return getResponseData(payload) || {};
  },

  updateMyProfile: async (
    profile: UserProfile,
    token: string
  ): Promise<UserProfile> => {
    const body: Record<string, any> = {
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
      typeof profile.location.latitude === 'number' &&
      typeof profile.location.longitude === 'number'
    ) {
      body.location = {
        latitude: profile.location.latitude,
        longitude: profile.location.longitude,
      };
    }

    Object.keys(body).forEach((key) => {
      if (body[key] == null) delete body[key];
    });

    const payload = await requestJson('/profiles/me', {
      method: 'PUT',
      token,
      body: JSON.stringify(body),
    });
    return getResponseData(payload) || {};
  },

  // TODO (Refactor): Move to Policy Repository (repositories/policy_repository.ts) / Policy Data Source (datasources/policy_datasource.ts)
  getOrganizationPolicy: async (
    organizationId: string,
    token?: string
  ): Promise<OrganizationPolicy | null> => {
    try {
      const payload = await requestJson(
        `/organization-policies/${organizationId}`,
        {
          method: 'GET',
          token,
        }
      );
      console.log("orgPolecy", payload);
      return getResponseData(payload) || null;
    } catch (error) {
      console.warn('Failed to fetch organization policy', error);
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
        method: 'PUT',
        token,
        body: JSON.stringify(policy),
      }
    );
    return getResponseData(payload);
  },

  updateOrganizationPolicySection: async (
    organizationId: string,
    section: 'logistics' | 'shipping' | 'salesRules',
    sectionData: Record<string, any>,
    token: string
  ) => {
    const payload = await requestJson(
      `/organization-policies/${organizationId}/${section}`,
      {
        method: 'PUT',
        token,
        body: JSON.stringify(sectionData),
      }
    );
    return getResponseData(payload);
  },

  // TODO (Refactor): Move to Order Repository (repositories/order_repository.ts) / Order Data Source (datasources/order_datasource.ts)
  createOrder: async (args: {
    organizationId: string;
    token: string;
    items: OrderItemData[];
    totalOrderPrice: number;
    senderDetails?: Record<string, any> | null;
    recipientDetails?: Record<string, any> | null;
    additionalCalculation: Record<string, number>;
    workflowSlug?: string;
    senderOrganizationId?: string;
    allowDefaultWorkflow?: boolean;
    calculationMode?: number;
    orderMode?: string;
  }) => {
    const params = new URLSearchParams();
    if (args.workflowSlug) params.set('workflowSlug', args.workflowSlug);
    if (args.senderOrganizationId) {
      params.set('senderOrganizationId', args.senderOrganizationId);
    }
    params.set(
      'allowDefaultWorkflow',
      String(args.allowDefaultWorkflow ?? true)
    );
    params.set('calculationMode', String(args.calculationMode ?? 2));
    if (args.orderMode) params.set('orderMode', args.orderMode);

    const path = `/orders/${args.organizationId}?${params.toString()}`;
    const payload = await requestJson(path, {
      method: 'POST',
      token: args.token,
      body: JSON.stringify({
        senderDetails: args.senderDetails !== undefined ? args.senderDetails : null,
        recipientDetails: args.recipientDetails !== undefined ? args.recipientDetails : null,
        totalOrderPrice: args.totalOrderPrice,
        items: args.items,
        additionalCalculation: args.additionalCalculation,
      }),
    });
    return getResponseData(payload);
  },
  getPublicOrders: async (token: string): Promise<any[]> => {
    const payload = await requestJson('/orders/public', {
      method: 'GET',
      token,
    });
    return getResponseData(payload) || [];
  },

  getCountries: async (): Promise<any[]> => {
    const payload = await requestJson('/locations/countries', { method: 'GET' });
    return getResponseData(payload) || [];
  },

  getGovernorates: async (countryId: string): Promise<any[]> => {
    const payload = await requestJson(`/locations/countries/${countryId}/governorates`, { method: 'GET' });
    return getResponseData(payload) || [];
  },

  getCities: async (governorateId: string): Promise<any[]> => {
    const payload = await requestJson(`/locations/governorates/${governorateId}/cities`, { method: 'GET' });
    return getResponseData(payload) || [];
  },

  // TODO (Refactor): Move to Config Repository (repositories/config_repository.ts) / Config Data Source (datasources/config_datasource.ts)
  // 1. Get Organization Config by name
  getConfig: async (orgName = clientConfig.defaultOrgName): Promise<OrgConfig> => {
    try {
      const response = await fetch(`${getBaseUrl()}/organization-configs/name/${orgName}`);
      if (!response.ok) throw new Error('Failed to fetch config');
      const resData = await response.json();
      const configData = resData.data || {};
      const logoUrl = configData.visual?.logoUrl ? getFullImageUrl(configData.visual.logoUrl) : undefined;

      // Promote nested website fields if they exist
      const socialMedia = configData.socialMedia || configData.website?.socialMedia;
      const footer = configData.footer || configData.website?.footer;

      return {
        ...FALLBACK_CONFIG,
        ...configData,
        socialMedia: socialMedia ?? FALLBACK_CONFIG.socialMedia,
        footer: footer ?? FALLBACK_CONFIG.footer,
        visual: {
          ...FALLBACK_CONFIG.visual,
          ...configData.visual,
          logoUrl: logoUrl ?? FALLBACK_CONFIG.visual.logoUrl
        },
        themes: { ...FALLBACK_CONFIG.themes, ...configData.themes }
      } as OrgConfig;
    } catch (error) {
      console.warn("Backend offline or error fetching config. Using static branding settings.", error);
      return FALLBACK_CONFIG;
    }
  },

  // Helper check: Only use mock data if explicitly enabled via config / env
  shouldUseMockData: (): boolean => {
    if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_ENABLE_DEMO_MOCK_DATA === 'true') {
      return true;
    }
    if ((clientConfig as any)?.enableDemoMockData === true) {
      return true;
    }
    return false;
  },

  // TODO (Refactor): Move to Blog Repository (repositories/blog_repository.ts) / Blog Data Source (datasources/blog_datasource.ts)
  // 2. Get Categories
  getCategories: async (organizationId: string): Promise<BlogCategory[]> => {
    try {
      const response = await fetch(`${getBaseUrl()}/blog/categories/organization/${organizationId}`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const resData = await response.json();
      const rawCategories = resData.data && resData.data.length > 0
        ? resData.data
        : (api.shouldUseMockData() ? FALLBACK_CATEGORIES : []);
      return rawCategories.map((c: any) => ({
        ...c,
        id: c.id || c.blogCategoryId || c._id
      }));
    } catch (error) {
      console.warn("Backend offline or error fetching categories.", error);
      return api.shouldUseMockData() ? FALLBACK_CATEGORIES : [];
    }
  },

  // 3. Get Posts
  getPosts: async (organizationId: string): Promise<BlogPost[]> => {
    try {
      const response = await fetch(`${getBaseUrl()}/blog/posts/organization/${organizationId}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      const resData = await response.json();
      const rawPosts = resData.data && resData.data.length > 0
        ? resData.data
        : (api.shouldUseMockData() ? FALLBACK_POSTS : []);
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
        introImageUrl: post.introImageUrl ? getFullImageUrl(post.introImageUrl) : undefined
      }));
    } catch (error) {
      console.warn("Backend offline or error fetching posts.", error);
      return api.shouldUseMockData() ? FALLBACK_POSTS : [];
    }
  },

  // TODO (Refactor): Move to Store Repository (repositories/store_repository.ts) / Store Data Source (datasources/store_datasource.ts)
  // 4. Get Product Details (for storefront)
  getProduct: async (productId: string): Promise<Product> => {
    try {
      const response = await fetch(`${getBaseUrl()}/products/${productId}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      const resData = await response.json();
      return mapProductFromApi(resData.data);
    } catch (error) {
      if (api.shouldUseMockData()) {
        return FALLBACK_PRODUCTS[productId] || { id: productId, name: `Product (${productId})`, price: 99, unit: "pcs" };
      }
      throw error;
    }
  },

  // 5. Get All Products
  getProducts: async (organizationId: string): Promise<Product[]> => {
    try {
      const rawProducts = await fetchOrganizationProductsRaw(organizationId);
      if (rawProducts.length === 0) {
        return api.shouldUseMockData() ? Object.values(FALLBACK_PRODUCTS) : [];
      }
      return rawProducts.map((p) => mapProductFromApi(p));
    } catch (error) {
      console.warn("Backend offline or error fetching products.", error);
      return api.shouldUseMockData() ? Object.values(FALLBACK_PRODUCTS) : [];
    }
  },

  // 6. Get Product Categories
  getProductCategories: async (organizationId: string): Promise<any[]> => {
    try {
      const response = await fetch(`${getBaseUrl()}/categories/organization/${organizationId}`);
      if (!response.ok) throw new Error('Failed to fetch product categories');
      const resData = await response.json();
      const rawCategories = resData.data || [];
      return rawCategories.map((c: any) => ({
        ...c,
        id: c.id || c.categoryId || c._id,
        imageUrl: (c.imageUrl || c.image) ? getFullImageUrl(c.imageUrl || c.image) : undefined,
        isActive: c.isActive !== false
      }));
    } catch (error) {
      console.warn("Backend offline or error fetching product categories.", error);
      return api.shouldUseMockData() ? FALLBACK_CATEGORIES : [];
    }
  },

  // TODO (Refactor): Move to Store Repository (repositories/store_repository.ts) / Store Data Source (datasources/store_datasource.ts)
  // 7. Get Offers
  getOffers: async (organizationId: string): Promise<Offer[]> => {
    try {
      const response = await fetch(`${getBaseUrl()}/offers/organization/${organizationId}`);
      if (!response.ok) throw new Error('Failed to fetch offers');
      const resData = await response.json();
      const rawOffers = resData.data && resData.data.length > 0 ? resData.data : [];
      return rawOffers.map((o: any) => ({
        ...o,
        id: o.id || o.offerId || o._id,
        imageUrl: o.imageUrl ? getFullImageUrl(o.imageUrl) : undefined,
        isActive: o.isActive !== false
      }));
    } catch (error) {
      console.warn("Backend offline or error fetching offers. Using empty fallback.", error);
      return [];
    }
  },
  // 8. Submit Feedback / Complaints
  submitFeedback: async (
    organizationId: string,
    payload: { name: string; contact: string; type: string; message: string }
  ): Promise<any> => {
    try {
      const response = await fetch(`${getBaseUrl()}/feedback/organization/${organizationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          ...payload,
          createdAt: new Date().toISOString(),
        }),
      });
      if (!response.ok) {
        const fallbackRes = await fetch(`${getBaseUrl()}/contact/organization/${organizationId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ organizationId, ...payload }),
        }).catch(() => null);
        if (fallbackRes && fallbackRes.ok) return await fallbackRes.json();
      }
      return await response.json();
    } catch (error) {
      console.warn("Error sending feedback payload to backend.", error);
      return { success: true };
    }
  }
};
