import { OrgConfig, BlogCategory, BlogPost, Product } from "@/types";
import clientConfig from "@/config/clientConfig.json";

export const FALLBACK_CONFIG: OrgConfig = {
  id: clientConfig.defaultOrgName || "deltastore",
  appBranding: {
    appTitle: clientConfig.appTitle || "Domancy",
    defaultOrgName: clientConfig.defaultOrgName || "deltastore",
  },
  visual: {
    logoUrl: clientConfig.logoUrl || "",
    faviconUrl: clientConfig.logoUrl || "",
    fontFamily: "Cairo",
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
      info: "0xFF2196F3",
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
      info: "0xFF42A5F5",
    },
    website: {
      headerBackground: "#FFFFFF",
      footerBackground: "#0F172A",
      footerText: "#FFFFFF",
      heroOverlay: "rgba(79, 70, 229, 0.1)",
    },
  },
  socialMedia: {
    facebook: "https://facebook.com/domansy",
    telegram: "https://t.me/domansy",
    whatsapp: "+20100000000",
  },
  footer: {
    address: "العنوان: القاهرة، جمهورية مصر العربية",
    email: "support@domancy.com",
    phone: "+20 100 000 0000",
    description: "دومانسي - بوابتك للتسوق الذكي وتوفير كافة احتياجاتك بأفضل جودة وأسعار منافسة.",
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
    `,
  },
  website: {
    sections: [
      {
        id: "web_offers",
        type: "offers",
        displayMode: "slider",
        title: "أحدث العروض والخصومات",
        isActive: true,
        config: { autoPlay: true },
      },
      {
        id: "web_categories",
        type: "categories",
        displayMode: "horizontal_list",
        title: "تسوق حسب التصنيف",
        isActive: true,
        config: {},
      },
      {
        id: "web_new_products",
        type: "new_products",
        displayMode: "grid",
        title: "وصل حديثاً",
        isActive: true,
        config: { crossAxisCount: 4 },
      },
      {
        id: "web_best_sellers",
        type: "best_seller",
        displayMode: "grid",
        title: "الأكثر مبيعاً",
        isActive: true,
        config: { crossAxisCount: 4 },
      },
      {
        id: "web_blog_posts",
        type: "blog_posts",
        displayMode: "grid",
        title: "أحدث المقالات في المدونة",
        isActive: true,
        config: { limit: 3 },
      },
    ],
    orderSettings: {
      workflowSlug: null,
      allowDefaultWorkflow: true,
      calculationMode: 2,
      orderMode: "C2B",
    },
  },
};

export const FALLBACK_CATEGORIES: BlogCategory[] = [
  { id: "cat-1", name: { ar: "عام", en: "General" }, organizationId: "deltastore", isActive: true },
  { id: "cat-2", name: { ar: "أخبار المتجر", en: "Store News" }, organizationId: "deltastore", isActive: true },
  { id: "cat-3", name: { ar: "نصائح وإرشادات", en: "Tips & Guides" }, organizationId: "deltastore", isActive: true },
  { id: "cat-4", name: { ar: "جديدنا", en: "What's New" }, organizationId: "deltastore", isActive: true },
];

export const FALLBACK_POSTS: BlogPost[] = [
  {
    id: "page-privacy",
    title: { ar: "سياسة الخصوصية", en: "Privacy Policy" },
    slug: "privacy",
    content: {
      ar: `<h3>1. جمع البيانات</h3><p>نقوم بجمع بياناتك الأساسية لمعالجة الشحنات وتوصيل الطلبات بنجاح.</p><h3>2. حماية البيانات</h3><p>بياناتك محمية بتشفير SSL عالي الأمان لضمان عدم تسريبها لأي طرف ثالث.</p>`,
      en: `<h3>1. Data Collection</h3><p>We collect essential data to process your shipments and deliver your orders successfully.</p><h3>2. Data Security</h3><p>Your data is protected using secure SSL encryption to prevent unauthorized access.</p>`,
    },
    postType: "page",
    organizationId: "deltastore",
    relatedProducts: [],
    isActive: true,
    showInFooter: true,
    showInNavigation: false,
    isJoker: false,
    isFeatured: false,
    seoKeywords: [],
  },
  {
    id: "page-returns",
    title: { ar: "سياسة الاسترجاع", en: "Return Policy" },
    slug: "returns",
    content: {
      ar: `<p>يمكنك استرجاع أو استبدال المنتجات التالفة خلال 14 يوماً من استلام الطلب بشرط سلامة العبوة الأصلية وعدم فتح الأختام المصنعية.</p>`,
      en: `<p>You can return or exchange damaged products within 14 days of receipt, provided the original packaging and safety seals are intact.</p>`,
    },
    postType: "page",
    organizationId: "deltastore",
    relatedProducts: [],
    isActive: true,
    showInFooter: true,
    showInNavigation: false,
    isJoker: false,
    isFeatured: false,
    seoKeywords: [],
  },
  {
    id: "page-about",
    title: { ar: "من نحن", en: "About Us" },
    slug: "about",
    content: {
      ar: `<p>متجر برو هو منصة رائدة في تقديم أفضل المنتجات التكنولوجية والإلكترونية مع محتوى معرفي غني من خلال مدونتنا المتخصصة لمساعدتك في اتخاذ قرارات الشراء الأنسب.</p>`,
      en: `<p>MatgerPro is a leading platform providing top-tier tech items alongside rich informational content through our dedicated blog to help you make informed purchase decisions.</p>`,
    },
    postType: "page",
    organizationId: "deltastore",
    relatedProducts: [],
    isActive: true,
    showInFooter: false,
    showInNavigation: true,
    isJoker: false,
    isFeatured: false,
    seoKeywords: [],
  },
  {
    id: "post-1",
    title: {
      ar: "دليلك الشامل لاختيار سماعات الرأس اللاسلكية",
      en: "Complete Guide to Wireless Headphones",
    },
    slug: "wireless-headphones-guide",
    seoDescription: {
      ar: "نصائح لشراء سماعة رأس لاسلكية بميزة إلغاء الضجيج وعمر بطارية طويل.",
      en: "Key pointers to purchase the best noise-cancelling headphones.",
    },
    content: {
      ar: "إن العثور على سماعة الرأس المثالية قد يكون تحدياً كبيراً نظراً لكثرة الخيارات المتاحة. في هذا الدليل، نغطي أهم المعايير التي يجب مراعاتها:\n\n1. جودة الصوت وإلغاء الضوضاء النشط (ANC).\n2. عمر البطارية وسرعة الشحن.\n3. راحة التصميم والوزن للاستخدام الطويل.\n\nتأكد من اختيار سماعة تدعم البلوتوث الحديث لتجنب تأخير الصوت.",
      en: "Finding the perfect headphones can be challenging with so many options. In this guide, we cover the primary parameters to watch for:\n\n1. Audio quality & Active Noise Cancellation (ANC).\n2. Battery life & fast charging.\n3. Fit comfort & build ergonomics for long hours.\n\nAlways opt for newer Bluetooth versions to prevent audio latency.",
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
    seoKeywords: [],
  },
  {
    id: "post-2",
    title: {
      ar: "كيف تزيد من إنتاجيتك باستخدام شاشات العرض المتعددة",
      en: "Maximize Productivity with Dual Monitors",
    },
    slug: "dual-monitors-productivity",
    seoDescription: {
      ar: "فوائد استخدام شاشتين للعمل البرمجي والتصميم وإدارة المهام.",
      en: "Benefits of using multiple screens for programming, design, and work.",
    },
    content: {
      ar: "تشير الدراسات إلى أن استخدام شاشة ثانوية يزيد الإنتاجية بنسبة تصل إلى 20-30%.\n\nمن خلال فصل مساحة العمل البرمجية عن نوافذ المحادثات والمتصفح، يمكنك تقليل التشتت والتركيز بشكل أعمق على الكود. ننصح بشاشات ذات دقة عالية لتجنب إجهاد العين.",
      en: "Studies show that a secondary monitor can enhance productivity by up to 20-30%.\n\nBy separating your core workspace from emails or messaging apps, you reduce context switching. We recommend high-resolution panels to prevent eye strain.",
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
    seoKeywords: [],
  },
  {
    id: "post-3",
    title: {
      ar: "مراجعة شاملة للابتوب الألعاب الأقوى هذا العام",
      en: "Top Gaming Laptop Review",
    },
    slug: "top-gaming-laptop-review",
    seoDescription: {
      ar: "مراجعة الأداء والمواصفات للابتوب الألعاب والرسومات الأحدث.",
      en: "In-depth hardware benchmark and gaming performance review.",
    },
    content: {
      ar: "قمنا باختبار لابتوب الألعاب الأحدث هذا الأسبوع تحت ضغط تشغيل أعلى جرافيكس.\n\nالأداء مذهل بفضل كرت الشاشة RTX الحديث والمعالج ثماني النواة، لكن واجهتنا حرارة طفيفة عند اللعب المتواصل لأكثر من 3 ساعات. ننصح باستخدام قاعدة تبريد مخصصة لرفع الكفاءة.",
      en: "We stress-tested the latest gaming laptops this week under maximum visual loads.\n\nThe benchmark shows incredible frames thanks to the RTX card and octa-core processor, but we experienced minor heat throttling after 3 hours. A cooling pad is advised.",
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
    seoKeywords: [],
  },
];

export const FALLBACK_PRODUCTS: Record<string, Product> = {};
