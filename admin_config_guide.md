# دليل تهيئة السكاشن والـ Widgets للوحة تحكم الإدارة (Admin Configuration Guide v2.0)

تم تحديث هذا الدليل ليشمل **جميع الـ Widgets الحالية + الـ 12 سكشن التفاعلية الجديدة** المعتمدة في [`SECTIONS_AND_DESIGN_PLAN.md`](file:///Users/moaz/Desktop/delta/products/saas%20products%20/matger-pro/matger-website/SECTIONS_AND_DESIGN_PLAN.md)، بالإضافة إلى **محرك إيقاع الخلفيات (`background`)**، وقاعدة **منع العناوين الافتراضية (`Zero Default Titles`)**، والربط المباشر بالمنتجات والمقالات.

---

## ⚠️ ١. القاعدة العامة للعناوين والخلفيات (تطبق على جميع الـ Widgets)

1. **العنوان الاختياري (`title` & `description`):**
   * إذا تُرك `section.title` فارغاً (`""` أو غير موجود)، **لن يظهر أي عنوان افتراضي نهائياً** وتختفي حاوية الهيدر تلقائياً لمنع الفراغات.
2. **محرك إيقاع الخلفيات (`section.config.background`):**
   * يمكن لأي سكشن في الموقع تمرير كائن `background` داخل `config`:
```json
{
  "background": {
    "type": "mesh_glow",
    "glowColor": "#D4AF37",
    "glowPosition": "center",
    "hasPattern": true,
    "dividerTop": "glow_line",
    "dividerBottom": "gradient_fade"
  }
}
```
* قيم `type` المدعومة: `"theme_default"` | `"solid"` | `"gradient_linear"` | `"mesh_glow"` | `"subtle_tint"` | `"contrast_break"` | `"radial_spotlight"`.

---

## 🧩 ٢. قائمة جميع أنواع الـ Widgets المتاحة للـ Admin (`section.type`)

### أ. الـ 12 Widget التفاعلية الجديدة:
1. **`hero_saas_interactive`**: الهيرو التفاعلي الحديث مع موكاب الهاتف وحقل الإدخال السريع للواتساب والشارات العائمة (`floatingStats`).
2. **`quick_trust_strip`**: شريط ركائز الثقة والأمان أو بيانات السجل التجاري والترخيص الصناعي (`items: [{ icon, text, value }]`).
3. **`pain_point_agitation`**: سكشن استعراض المشاكل والتحديات (`badgeText`, `highlightAlertWord`, `cards: [{ icon, title, desc }]`).
4. **`comparison_matrix`**: المقارنة الثنائية المباشرة بين عمودين (`oldWayTitle`, `oldWayItems`, `newWayTitle`, `newWayItems`).
5. **`system_screens_showcase`**: معرض شاشات النظام/المنتجات داخل إطار جهاز واقعي مع نقاط تفاعلية نابضة (`hotspots`) وبطاقة تحويل جانبية مربوطة بمنتج (`productId`) أو مقال (`postSlug`).
6. **`process_steps_interactive`**: خطوات العمل المرقمة (`steps: [{ number: "01", title, desc }]`) مع أرقام مائية خلفية.
7. **`video_explainer_showcase`**: مشغل الفيديو التوضيحي (`videoType: "youtube" | "mp4"`, `videoUrl`, `ctaButtonText`, `ctaButtonLink`).
8. **`target_audience_industries`**: كبسولات القطاعات والأنشطة المستهدفة أو منافذ التوزيع (`industries: [{ name, icon, description, demoLink }]`).
9. **`urgency_offer_strip`**: شريط العرض الترويجي مع مؤقت العد التنازلي (`badgeText`, `offerHeadline`, `showCountdown`, `countdownEndsAt`, `buttonText`, `buttonLink`).
10. **`ecosystem_integrations`**: منظومة الشركاء والتكاملات والاعتمادات مبوبة حسب الفئة (`categories: [{ id, name, logos: [...] }]`).
11. **`pricing_saas_slider`**: سلايدر الباقات مع مفتاح تبديل (شهري / سنوي) وشارة التوفير (`defaultPeriod`, `yearlyDiscountBadge`, `plans`).
12. **`high_impact_cta_banner`**: بانر الإغلاق والتحويل النهائي عالي التباين (`headline`, `subheadline`, `buttonText`, `buttonLink`, `buttonGradient`).

### ب. الـ Widgets الأساسية والمحدثة (تدعم الربط بالمنتجات والمقالات):
13. **`intro_slides`**: سلايدر المقدمة الرئيسي (`apple_fullscreen`, `minimal_glass`, `full_split`, `classic_centered`).
14. **`about_company`**: سكشن "من نحن / نبذة عن الشركة" — يعمل الآن في **جميع الأوضاع (`store`, `blog`, `hybrid`)** ويدعم تمرير نص مباشر `config.content` وصورة `config.imageUrl` أو ربطه بمقال عبر `config.postSlug` مع تحديد `imagePosition` (`left`, `right`, `top`, `bottom`).
15. **`features`**: شبكة المميزات التنافسية أو الرؤية والرسالة (`items: [{ icon, title, description, targetType, productId, postSlug }]`).
16. **`tabs_showcase`**: التبويبات التفاعلية لعرض الفروع ومنافذ التوزيع أو تفاصيل النظام (`tabs: [{ label, content, items: [...] }]`).
17. **`showcase`**: معرض الصور التفاعلي مع دعم الربط المباشر بمنتج أو مقال لكل شريحة.
18. **`trust_badges`**: بطاقات الثقة والبيانات الرسمية (`items: [{ icon, title, description }]`).
19. **`banner` / `custom_banner`**: البانر الترويجي بنمطي `promo_card` و `offers_box`.
20. **`offers`**: سلايدر العروض الديناميكية (`default` أو `hero_slide`).
21. **`categories`**: شريط التصنيفات (`round`, `glass_card`, `pills`).
22. **`new_products` / `best_seller` / `products`**: شبكة المنتجات.
23. **`blog_posts` / `most_read_posts` / `joker_post`**: شبكة المقالات ومقال الجوكر.
24. **`testimonials` / `faqs` / `newsletter_signup` / `pricing` / `contact_us`**.

---

## 🍦 ٣. مثال تطبيقي جاهز: بروفايل "شركة دومانسي للآيس كريم" كاملاً بالـ Widgets

يمكنك نسخ مصفوفة `sections` التالية ووضعها في إعدادات `website.sections` لبناء صفحة البروفايل التعريفي لشركة دومانسي بالكامل:

```json
[
  {
    "id": "domancy_hero",
    "type": "hero_saas_interactive",
    "title": "",
    "isActive": true,
    "config": {
      "trustedBadge": "تأسست عام 2015م • علامة تجارية مسجلة (0476968)",
      "headline": "شركة دومانسي لإنتاج",
      "highlightWord": "الآيس كريم والمثلجات",
      "subheadline": "البروفايل التعريفي والبروتوكول التسويقي - نعيد تعريف مفهوم السعادة والانتعاش في سوق الآيس كريم المصري بأعلى معايير الجودة العالمية.",
      "imageUrl": "/images/logo/domancy_logo.png",
      "quickInput": {
        "enabled": true,
        "placeholder": "أدخل رقم هاتفك للتواصل مع إدارة المبيعات والتوزيع",
        "buttonText": "تواصل عبر واتساب"
      },
      "floatingStats": [
        { "label": "الطاقة الإنتاجية", "value": "2400 طن/سنوياً" },
        { "label": "حليب ومكونات طبيعية", "value": "100% نقية" }
      ],
      "background": {
        "type": "mesh_glow",
        "glowColor": "#e91e63",
        "glowPosition": "top"
      }
    }
  },
  {
    "id": "domancy_official_data",
    "type": "quick_trust_strip",
    "title": "",
    "isActive": true,
    "config": {
      "items": [
        { "icon": "📜", "text": "رقم السجل التجاري", "value": "376831653" },
        { "icon": "🏭", "text": "رقم الترخيص الصناعي", "value": "1019012802003944" },
        { "icon": "📅", "text": "سنة التأسيس والإنشاء", "value": "2015م" },
        { "icon": "®️", "text": "العلامة التجارية المسجلة", "value": "دومانسي (0476968)" }
      ]
    }
  },
  {
    "id": "domancy_about",
    "type": "about_company",
    "title": "مَن نحن (نبذة عن الشركة)",
    "description": "منشأة رائدة متخصصة في صناعة وتطوير المثلجات اللبنية والكريمة المثلجة",
    "isActive": true,
    "config": {
      "imagePosition": "left",
      "content": "تأسست شركة دومانسي آيس كريم (Domancy Ice Cream) في عام 2015 كمنشأة رائدة متخصصة في صناعة وتطوير المثلجات اللبنية والكريمة المثلجة بأعلى معايير الجودة العالمية.\n\nانطلقت الشركة برؤية واضحة تهدف إلى إعادة تعريف مفهوم السعادة والانتعاش في سوق الآيس كريم المصري، بالاعتماد على أفضل المكونات الطبيعية وأحدث خطوط الإنتاج التكنولوجية لتقديم تجربة تذوق فريدة تناسب كافة الأذواق والفئات الاستهلاكية.",
      "background": {
        "type": "subtle_tint",
        "glowColor": "#e91e63"
      }
    }
  },
  {
    "id": "domancy_vision_mission",
    "type": "comparison_matrix",
    "title": "الرؤية والرسالة",
    "description": "",
    "isActive": true,
    "config": {
      "oldWayIcon": "🎯",
      "oldWayTitle": "رؤيتنا (Our Vision)",
      "oldWayItems": [
        "أن نصبح العلامة التجارية الأولى والأكثر موثوقية في قطاع إنتاج الآيس كريم والمثلجات في مصر والشرق الأوسط.",
        "أن ترتبط هويتنا دائماً بالجودة والابتكار المستمر لتلبية تطلعات المستهلك الحديث."
      ],
      "newWayIcon": "🛡️",
      "newWayTitle": "رسالتنا (Our Mission)",
      "newWayItems": [
        "الالتزام بتقديم منتجات آمنة، صحية، ومتميزة تنال رضا عملائنا.",
        "الحفاظ على أعلى معايير السلامة الغذائية والتطوير الدائم لنكهاتنا ومنتجاتنا لتواكب أعلى المقاييس المعتمدة."
      ]
    }
  },
  {
    "id": "domancy_capacity",
    "type": "custom_banner",
    "title": "القدرة الإنتاجية والبنية التحتية",
    "description": "تستند شركة دومانسي إلى بنيتها التحتية القوية المتمثلة في مصنعها المتطور المجهز بأحدث المعدات والآلات الأوتوماتيكية بالكامل، حيث تبلغ الطاقة الإنتاجية السنوية للشركة 2400 طن من الآيس كريم والجيلاتي عالي الجودة. يعمل المصنع تحت إشراف كامل من الجهات الرقابية وهيئة التنمية الصناعية ووفقاً للترخيص الصناعي الدائم لإنتاج الكريمة المثلجة والمثلجات اللبنية بأنواعها لضمان ثبات الجودة والتميز.",
    "isActive": true,
    "config": {
      "variant": "offers_box",
      "badgeText": "🏭 2400 طن سنوياً • خطوط أوتوماتيكية بالكامل",
      "buttonText": "تصفح منتجاتنا",
      "buttonLink": "/store"
    }
  },
  {
    "id": "domancy_distribution",
    "type": "tabs_showcase",
    "title": "التواجد الجغرافي وشبكة التوزيع",
    "description": "تتخذ الشركة من مدينة العبور مركزاً رئيسياً وإدارياً لإدارة عملياتها اللوجستية والتصنيعية، وتمتلك شبكة توزيع ومنافذ بيع استراتيجية تغطي مختلف أقاليم ومحافظات الجمهورية:",
    "isActive": true,
    "config": {
      "tabs": [
        {
          "label": "كافة الفروع ومنافذ البيع",
          "items": [
            { "icon": "🏭", "title": "الفرع الرئيسي والمصنع", "description": "مدينة العبور - المركز الرئيسي والإداري والتصنيعي" },
            { "icon": "🏖️", "title": "منفذ بيع مطروح", "description": "لخدمة قطاع الساحل الشمالي والمصايف والخط الساحلي" },
            { "icon": "🌴", "title": "منفذ بيع الغردقة", "description": "لخدمة القطاع السياحي، الفنادق، ومحافظة البحر الأحمر" },
            { "icon": "🚚", "title": "منفذ بيع الشرقية والإسماعيلية", "description": "لخدمة قطاع شرق الدلتا ومدن القناة" },
            { "icon": "📍", "title": "منفذ بيع طنطا", "description": "لخدمة قطاع وسط الدلتا" },
            { "icon": "☀️", "title": "منفذ بيع سوهاج", "description": "لخدمة قطاع الصعيد والوجه القبلي" }
          ]
        }
      ]
    }
  },
  {
    "id": "domancy_advantages",
    "type": "features",
    "title": "المميزات التنافسية للشركة",
    "description": "",
    "isActive": true,
    "config": {
      "items": [
        {
          "icon": "🥛",
          "title": "جودة الخامات الصافية",
          "description": "نعتمد بشكل أساسي على الحليب الطبيعي والمكونات النقية 100% الخالية من الزيوت المهدرجة أو الإضافات الصناعية الضارة."
        },
        {
          "icon": "🍨",
          "title": "تنوع وتجدد المنتجات",
          "description": "نقدم تشكيلة واسعة من النكهات والأحجام المبتكرة التي تناسب الاستهلاك الفردي، العائلي، وقطاعات الضيافة (الفنادق والمطاعم والكافيهات وقطاع الماركت)."
        },
        {
          "icon": "✅",
          "title": "الالتزام المطلق بالمعايير",
          "description": "نطبق أدق اشتراطات السلامة والصحة المهنية ونظم الرقابة الصناعية الغذائية في كافة مراحل التصنيع، التعبئة، والتجميد الفوري."
        }
      ]
    }
  },
  {
    "id": "domancy_closing_cta",
    "type": "high_impact_cta_banner",
    "title": "",
    "isActive": true,
    "config": {
      "headline": "شركة دومانسي آيس كريم - جودة تثق بها، وانتعاش يدوم.",
      "subheadline": "تواصل معنا الآن لطلبات التوريد للفنادق، المطاعم، الكافيهات، وقطاع الماركت في كافة أنحاء الجمهورية",
      "buttonText": "تواصل مع إدارة المبيعات",
      "buttonLink": "/store",
      "buttonGradient": ["#c2185b", "#ad1457"]
    }
  }
]
```
