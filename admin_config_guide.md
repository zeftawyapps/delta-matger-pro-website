# دليل إعدادات السكاشن والواجهات للوحة تحكم الإدارة (Admin Configuration Guide v3.0)

تم تحديث وتوسيع هذا الدليل الشامل ليغطي جميع الميزات والخصائص الجديدة المضافة للموقع:
1. **محرك تنسيق العناوين (Section Header Engine)**: التحكم في شكل العنوان وتوسيطه والخط التزييني والبادج.
2. **محرك الاستدارة والظلال والارتفاع (Card Radius, Shadow & Elevation)**: ضبط شكل الكروت وحاويات السكاشن.
3. **محرك المسافات والهوامش (Spacing & Margin Engine)**: مسافات اختيارية بالكامل (بدون أي مسافات إجبارية).
4. **محرك أنيميشن السكرول (Scroll Reveal Animation)**: تخصيص نوع ومدة وسلوك الحركة عند النزول.
5. **محرك خلفيات السكاشن والخطوط الفاصلة (Background & Dividers)**: تلوين كامل بعرض الشاشة مع خطوط توهج اختيارية.
6. **تخصيص سيكشن المقالات (`blog_posts`) وشريط التنقل (`Navbar`)**.

---

## 📑 الفهرس
- [١. محرك تنسيق عناوين السكاشن (Section Header)](#١-محرك-تنسيق-عناوين-السكاشن-section-header)
- [٢. محرك الاستدارة والظلال والارتفاع للكروت (Card Styling)](#٢-محرك-الاستدارة-والظلال-والارتفاع-للكروت-card-styling)
- [٣. محرك عرض السيكشن والهوامش الأربعة (Section Width & 4-Directional Margins)](#٣-محرك-عرض-السيكشن-والهوامش-الأربعة-section-width--4-directional-margins)
- [٤. أنيميشن ظهور السكاشن مع السكرول (Scroll Animation)](#٤-أنيميشن-ظهور-السكاشن-مع-السكرول-scroll-animation)
- [٥. محرك الخلفيات المتصلة والخطوط الفاصلة (Background Rhythm)](#٥-محرك-الخلفيات-المتصلة-والخطوط-الفاصلة-background-rhythm)
- [٦. تخصيص سيكشن المقالات (Blog Posts) وشريط التنقل (Navbar)](#٦-تخصيص-سيكشن-المقالات-blog-posts-وشريط-التنقل-navbar)
- [٧. نموذج JSON متكامل لتطبيقه في لوحة التحكم](#٧-نموذج-json-متكامل-لتطبيقه-في-لوحة-التحكم)
- [١٤. محرك التأثيرات واللمسات البصرية فائقة العصرية (Ultra-Modern 2026 Visual Effects)](#١٤-محرك-التأثيرات-واللمسات-البصرية-فائقة-العصرية-ultra-modern-2026-visual-effects)

---

## ١. محرك تنسيق عناوين السكاشن (Section Header)

يدعم أي سيكشن يحتوي على عنوان أو وصف إمكانية التنسيق المباشر عبر الحقول التالية داخل `section.config`:

### الحقول المتاحة في الـ Admin:
| الحقل في `config` | نوع العنصر في واجهة الأدمن | الخيارات والقيم المدعومة | الشرح |
| :--- | :--- | :--- | :--- |
| `title` | **Text Input** (حقل نصي) | نص حر (عربي / إنجليزي) | عنوان السيكشن. **إذا تُرِك فارغاً لن يظهر أي عنوان نهائياً (قاعدة Zero Default Titles)**. |
| `description` | **Text Area** (حقل نصي متعدد) | نص حر | الوصف التوضيحي أسفل العنوان. |
| `titleStyle` | **Select Dropdown** | `gradient` (افتراضي)<br>`solid`<br>`glow`<br>`accent_bar`<br>`badge_header`<br>`flanked_lines`<br>`underlined` | **gradient**: تدرج لوني فخم (يدعم `titleGradient: ["#c2185b", "#097E8A"]`).<br>**solid**: لون موحد مصمت وواضح.<br>**glow**: توهج مشع ناعم للعنوان (يطابق `glowColor` أو `titleColor`).<br>**accent_bar**: إضافة خط ديكوري متدرج أنيق أسفل العنوان مباشرة وقبل الوصف.<br>**badge_header**: إبراز بادج كبسولي أعلى العنوان (ذكي وتلقائي إن لم يُحدد نص).<br>**flanked_lines**: خطوط جانبية تحيط بالعنوان من اليمين واليسار (`── عنوان ──`).<br>**underlined**: خط سفلي كامل يمتد أسفل العنوان مع تلاشي جانبي متناسق. |
| `titleAlign` | **Select Dropdown** | `start` (افتراضي)<br>`center`<br>`split` | **start**: محاذاة لليمين (عربي) أو لليسار (إنجليزي).<br>**center**: توسيط كامل في المنتصف مع الوصف والبادج.<br>**split**: العنوان في جهة وزر الإجراء (مثل "عرض الكل") في الجهة المقابلة. |
| `titleSize` | **Select Dropdown** | `sm` \| `md` \| `lg` \| `xl` | `sm` (صغير 1.4rem)<br>`md` (متوسط قياسي 2rem)<br>`lg` (كبير 2.6rem)<br>`xl` (استعراضي ضخم 3.5rem). |
| `titleColor` | **Color Picker** (أو Hex) | كود لون مثلاً `#ECC951` | تحديد لون مخصص للنص بدلاً من اللون الافتراضي (يفك قيود التدرج تلقائياً). |
| `titleGradient` | **Color Array** | مصفوفة لونين `["#HEX1", "#HEX2"]` | تدرج لوني مخصص بالكامل لكلمات العنوان. |
| `accentColor` | **Color Picker** (أو Hex) | كود لون مثلاً `#097E8A` | تخصيص لون الخط الديكوري في نمط `accent_bar` أو `flanked_lines`. |
| `glowColor` | **Color Picker** (أو Hex) | كود لون مثلاً `#c2185b` | تخصيص لون هالة التوهج في نمط `glow`. |
| `subtitleColor` | **Color Picker** (أو Hex) | كود لون مثلاً `#1A2332` | تحديد لون مخصص للوصف (مع إظهار اللون بنقاء كامل دون بهتان). |
| `badgeText` | **Text Input** | نص حر (مثل: `✦ المدونة الحصرية`) | شارة كبسولية عصرية تظهر أعلى العنوان. |
| `badgeColor` | **Color Picker** | كود لون مثلاً `#097E8A` | لون نص وحدود البادج. |
| `badgeBg` | **Color Picker** | كود لون مثلاً `#1A2332` | لون خلفية البادج. |

```json
{
  "title": "أحدث مقالاتنا ورؤانا التقنية",
  "description": "اكتشف أحدث المقالات والأفكار الحصرية المنشورة في المتجر",
  "config": {
    "titleStyle": "accent_bar",
    "titleAlign": "split",
    "titleSize": "lg",
    "badgeText": "✦ مقالات مميزة",
    "titleColor": "#FFFFFF"
  }
}
```

---

## ٢. محرك الاستدارة والظلال والارتفاع للكروت (Card Styling)

يتحكم في شكل الكروت والحاويات والعناصر التفاعلية داخل السيكشن (`.glassCard`، كروت المنتجات، كروت المقالات، إلخ):

| الحقل في `config` | نوع العنصر في واجهة الأدمن | القيم المدعومة | الشرح |
| :--- | :--- | :--- | :--- |
| `cardRadius` | **Select أو Number Input** | `none` (`0px`)<br>`xs` (`4px`)<br>`sm` (`8px`)<br>`md` (`16px` - افتراضي)<br>`lg` (`24px`)<br>`xl` (`32px`)<br>`pill` (`9999px`)<br>أو رقم بالبكسل مثل `12` أو `20` | يتحكم في استدارة حواف الكروت من حادة ومربعة تماماً إلى دائرية انسيابية. |
| `cardShadow` | **Select Dropdown** | `none` (مسطح Flat)<br>`sm` أو `subtle` (ظل خفيف جداً)<br>`md` أو `medium` (ظل متوازن قياسي)<br>`lg` أو `high` (ظل بارز ثلاثي الأبعاد)<br>`xl` أو `floating` (ظل سينمائي عائم)<br>`glow` (توهج مشع بلون الهوية) | عمق وبروز الكارت عن الخلفية. |
| `cardElevation` | **Select أو Number Input** | `none` (`0px`)<br>`low` (`-3px`)<br>`medium` (`-6px` - افتراضي)<br>`high` (`-12px`)<br>أو رقم بالبكسل مثل `8` | مقدار ارتفاع الكارت للأعلى عند تمرير مؤشر الماوس عليه (Hover Lift). |

```json
{
  "config": {
    "cardRadius": "24px",
    "cardShadow": "lg",
    "cardElevation": "medium"
  }
}
```

---

## ٣. محرك عرض السيكشن والهوامش الأربعة (Section Width & 4-Directional Margins)

> [!IMPORTANT]
> **قاعدة العرض والهوامش**:
> 1. **التحكم في عرض السيكشن (`sectionWidth` & `maxWidth`)**: يتيح تحديد ما إذا كان السيكشن بعرض الحاوية القياسية (`container` 1280px)، أو عرض مريح وضيق للمقالات والرسالة (`narrow` 900px)، أو عرض كامل الشاشة (`full` 100%)، أو عرض مخصص بالبكسل (`custom`).
> 2. **الهامش الأفقي التلقائي (Right & Left)**: يطبق الموقع تلقائياً هامشاً أفقياً انسيابياً متجاوباً `clamp(1rem, 2.5vw, 2rem)` لليمين واليسار لكل سيكشن لحماية المحتوى من الالتصاق بحواف الشاشة. كما يمكن تخصيصه بقيم دقيقة أو إيقافه عبر لوحة التحكم.
> 3. **المسافات الرأسية (Vertical Spacing)**: الافتراضي هو **(0 Margin)** بين السكاشن رأسياً لضمان اتصال الخلفيات بنعومة، وتكون المسافات الرأسية اختيارية تماماً.

### جدول خيارات العرض والهوامش في الـ Admin:
| الحقل في `config` | نوع العنصر في واجهة الأدمن | القيم المدعومة | الشرح |
| :--- | :--- | :--- | :--- |
| `sectionWidth` | **Select Dropdown** | `container` (افتراضي: 1280px)<br>`narrow` (عرض ضيق 900px)<br>`full` (عرض كامل 100%)<br>`custom` (عرض مخصص) | تحديد نمط اتساع وعرض حاوية السيكشن. |
| `maxWidth` | **Number / Text Input** | مثلاً `900`، `1100`، `"900px"` | أقصى عرض للحاوية بالبكسل (يُستخدم مع نمطي `narrow` و `custom`). |
| `marginTop` | **Number Input** (بالبكسل) | مثلاً `0`، `20`، `40` | مسافة رأسية دقيقة أعلى السيكشن بالبكسل. |
| `marginBottom` أو `margin` | **Number Input** (بالبكسل) | مثلاً `0`، `20`، `30`، `60` | مسافة رأسية دقيقة أسفل السيكشن بالبكسل. |
| `marginRight` | **Number / Text Input** | مثلاً `16`, `24`, `"24px"` | هامش مخصص لجهة اليمين تحديداً. |
| `marginLeft` | **Number / Text Input** | مثلاً `16`, `24`, `"24px"` | هامش مخصص لجهة اليسار تحديداً. |
| `marginX` أو `marginHorizontal` | **Number / Text Input** | مثلاً `20`, `24`, `"2rem"` | مزامنة الهامش الأفقي لليمين واليسار معاً بقيمة موحدة. |
| `hasMarginX` أو `hasHorizontalMargin` | **Switch / Checkbox** | `true` (افتراضي: تفعيل الهامش)<br>`false` (إلغاء الهامش وجعل السيكشن يمتد للحواف) | تشغيل أو تعطيل الهامش الأفقي التلقائي للسيكشن. |
| `hasMargin` | **Switch / Checkbox** | `false` (افتراضي: صفر مسافة رأسية)<br>`true` (يضيف مسافة سفلية `2.5rem`) | تفعيل أو إيقاف المسافة القياسية السفلية. |
| `paddingY` | **Number Input** (بالبكسل) | مثلاً `0`، `40`، `60` | مسافة الحشو الداخلي الرأسي للسيكشن (أعلى وأسفل). |
| `paddingX` أو `paddingHorizontal` | **Number / Text Input** | مثلاً `16`, `24` | مسافة الحشو الداخلي الأفقي للسيكشن (يمين ويسار). |

### نموذج JSON شامل للعرض والهوامش الأربعة:
```json
{
  "id": "web_contact_us",
  "type": "about_company",
  "displayMode": "grid",
  "title": "من نحن",
  "isActive": true,
  "config": {
    "sectionWidth": "narrow",
    "maxWidth": 900,
    "marginTop": 20,
    "marginBottom": 30,
    "marginRight": 24,
    "marginLeft": 24,
    "hasMarginX": true,
    "paddingY": 40,
    "paddingX": 16
  }
}
```

> [!TIP]
> عند اختيار `"sectionWidth": "narrow"` يكون السيكشن مريحاً جداً للقراءة والتركيز (مثالي لصفحات من نحن، الرسالة والرؤية، والمدونة) حيث يتوسط الشاشة تلقائياً مع الحفاظ على الهوامش الجانبية المتجاوبة على شاشات الموبايل.

---

## ٤. أنيميشن ظهور السكاشن مع السكرول (Scroll Animation)

تظهر السكاشن تلقائياً بحركة انسيابية راقية مع السكرول باستخدام تقنية `IntersectionObserver`:

| الحقل في `config.animation` | نوع العنصر في واجهة الأدمن | القيم المدعومة |
| :--- | :--- | :--- |
| `type` | **Select Dropdown** | `fade_up` (الافتراضي: صعود ناعم مع ظهور)<br>`fade_in` (ظهور تدريجي هادئ)<br>`zoom_in` (تكبير سينمائي ناعم)<br>`slide_left` (انزلاق من اليمين)<br>`slide_right` (انزلاق من اليسار)<br>`none` (إلغاء الحركة تماماً) |
| `duration` | **Number Input** (بالثواني) | افتراضي `0.65` (مثلاً: `0.5`, `0.8`) |
| `delay` | **Number Input** (بالثواني) | افتراضي `0` (مثلاً: `0.1`, `0.2`) |
| `once` | **Switch / Checkbox** | `true` (تعمل الحركة مرة واحدة عند أول نزول) |

```json
{
  "config": {
    "animation": {
      "type": "fade_up",
      "duration": 0.65,
      "delay": 0.1,
      "once": true
    }
  }
}
```

---

## ٥. محرك الخلفيات المتصلة والخطوط الفاصلة (Background Rhythm)

يسمح بتلوين وتنسيق خلفية أي سيكشن لتمتد على **عرض الشاشة بالكامل (100vw)** دون أي هوامش جانبية بيضاء:

| الحقل في `config.background` | نوع العنصر في واجهة الأدمن | الخيارات |
| :--- | :--- | :--- |
| `type` | **Select Dropdown** | `theme_default` (افتراضي الثيم)<br>`solid` (لون مصمت موحد)<br>`gradient_linear` (تدرج لوني بين لونين)<br>`mesh_glow` (توهج مشع في الخلفية)<br>`contrast_break` (خلفية داكنة عالية التباين)<br>`subtle_tint` (تظليل لوني خفيف) |
| `solidColor` | **Color Picker** | مثلاً `#0F172A` |
| `gradientColors` | **2x Color Pickers** | مصفوفة لونين للتدرج مثل `["#097E8A", "#1A2332"]` |
| `glowColor` | **Color Picker** | لون التوهج المشع مثل `#097E8A` |
| `glowPosition` | **Select Dropdown** | `center`, `top`, `bottom`, `corners` |
| `dividerTop` | **Select Dropdown** (خط فاصل علوي) | `none` (بدون خط - افتراضي)<br>`glow_line` (خط توهج مضيء فخم)<br>`gradient_fade` (تلاشي تدرجي ناعم) |
| `dividerBottom` | **Select Dropdown** (خط فاصل سفلي) | `none`<br>`glow_line`<br>`gradient_fade` |

```json
"background": {
  "type": "gradient_linear",
  "gradientColors": ["#097E8A", "#1A2332"],
  "glowColor": "#097E8A",
  "glowPosition": "center",
  "dividerTop": "glow_line",
  "dividerBottom": "none"
}
```

---

## ٦. تخصيص سيكشن المقالات (Blog Posts) وشريط التنقل (Navbar)

### أ. سيكشن المقالات (`blog_posts`):
1. **نمط العرض (`displayMode`)**:
   - `"grid"`: يعرض شبكة المقالات فقط بالعدد المحدد في `limit` **دون إقحام أي سيكشن أو كارت مميز إضافي**.
   - `"featured"`: يعرض كارت المقال المميز فقط.
2. **إظهار الكارت المميز اختياري (`showFeatured`)**:
   - `false` (افتراضي).
   - `true`: يعرض كارت المقال المميز أعلى الشبكة إذا أردت ذلك يدوياً.
3. **التوجيه الذكي للروابط والأقسام**:
   - شارة القسم (`Category Badge`) الموجودة أعلى الكارت أصبحت رابطاً تفاعلياً؛ الضغط عليها ينقل الزائر فورياً إلى أرشيف القسم التابع له المقال (`/blog?category=...`).
   - زر "اقرأ المزيد" ورابط الكارت يدعم فك ترميز النصوص العربية والـ Slugs المرمزة والـ IDs دون أخطاء.
   - زر "عرض الكل" أعلى السيكشن يربط مباشرة بالقسم المحدد في `config.blogCategoryId`.

### ب. شريط التنقل المتجاوب (`Navbar`):
- يضاف في إعدادات الموقع العامة `website`:
```json
"website": {
  "excessLinksMode": "dropdown"
}
```
- **`"dropdown"` (افتراضي)**: في شاشات الموبايل، الضغط على زر القائمة (☰) يفتح **قائمة منسدلة (Dropdown Drawer)** متصلة مباشرة أسفل شريط النافبار.
- **`"sidebar"`**: يفتح القائمة الجانبية المنزلقة كالمعتاد.

### ج. التحكم في شعار وهوية الفوتر (`Footer Logo & Branding`):
تُحفظ خيارات الشعار والهوية الخاصة بالفوتر داخل كائن `website.footer` في `OrganizationConfig`:
```json
"website": {
  "footer": {
    "showLogo": true,
    "logoUrl": "https://storage.googleapis.com/.../footer-logo.png",
    "logoHeight": 45,
    "showTitle": true,
    "logoStyle": "solid",
    "description": "وصف الموقع والنشاط في الفوتر...",
    "address": "القاهرة، جمهورية مصر العربية",
    "phone": "+201000000000",
    "email": "info@domancy.com"
  }
}
```

| الحقل | النوع | القيمة الافتراضية | الوصف |
| :--- | :--- | :--- | :--- |
| `showLogo` | `boolean` | `true` | إظهار أو إخفاء الشعار تماماً في الفوتر. |
| `logoUrl` | `string` | `""` | رابط مخصص لشعار الفوتر. إذا كان فارغاً، يتم استخدام شعار الموقع العام (`visual.logoUrl`). |
| `logoHeight` | `number` | `0` (تلقائي) | ارتفاع الشعار بالبكسل لتنسيق حجمه مع محتوى الفوتر. |
| `showTitle` | `boolean` | `true` | إظهار اسم المنظمة / المتجر بجوار الشعار في الفوتر. |
| `logoStyle` | `string` | `"solid"` | نمط الشعار: `"solid"` (لون صريح)، أو `"gradient"` (تدرج لوني يعكس ألوان الهوية). |

---

### د. قسم مقالات مختارة (`Selected Articles` - `type: "selected_articles"`):
قسم يتيح عرض قائمة مقالات منتقاة ومخصصة بصورها وروابطها وعناوينها وشاراتها التوضيحية:

```json
{
  "id": "web_selected_articles",
  "type": "selected_articles",
  "displayMode": "horizontal_list",
  "title": "مقالات مختارة",
  "description": "مجموعة منتقاة من أهم المقالات والأدلة المفيدة لك",
  "isActive": true,
  "config": {
    "autoPlay": false,
    "items": [
      {
        "title": "كيف تبدأ تجارتك الإلكترونية بنجاح في 2026",
        "imageUrl": "https://storage.googleapis.com/.../ecommerce-article.jpg",
        "linkUrl": "/blog/ecommerce-guide-2026",
        "badge": "دليل شامل",
        "description": "خطوات عملية للانطلاق بمتجرك الإلكتروني وتحقيق أول 100 مبيعة."
      }
    ]
  }
}
```

- **أنماط العرض المدعومة (`displayMode`)**:
  1. `horizontal_list`: شريط أفقي انسيابي بـ Smooth Horizontal Scroll وأزرار تحكم على الديسكتوب.
  2. `grid`: شبكة كروت متجاوبة مع تأثيرات التمرير.
  3. `slider`: سلايدر كاروسيل يدعم التشغيل التلقائي (`autoPlay: true`) ونقاط ومؤشرات التنقل.

- **دليل إضافة رابط المقال والاختيار التلقائي للمقالات**:
  1. **روابط المقالات في لوحة التحكم (`BlogsScreen`)**:
     - للمقالات: `/blog/{slug}` (أو `/blog/{id}`)
     - للصفحات الثابتة: `/{slug}`
     - للشرائح التعريفية: `/intro/{slug}`
     - نسخ الرابط بنقرة واحدة إلى الحافظة (`Clipboard`).
  2. **الاختيار التلقائي في `selected_articles`**:
     - زر **"اختيار مقال تلقائياً"** في رأس بطاقة كل مقالة داخل السكشن.
     - زر **"إضافة مقال من المقالات المنشورة (تلقائي)"** أسفل القائمة للملء الفوري لـ (`title`, `linkUrl`, `imageUrl`, `badge`, `description`).

---

## ٧. نموذج JSON متكامل لتطبيقه في لوحة التحكم

هذا مثال عملي يوضح تطبيق كافة الخصائص معاً في كائن سيكشن واحد:

```json
[
  {
    "id": "web_sec_custom_blog",
    "type": "blog_posts",
    "displayMode": "grid",
    "title": "أحدث المقالات والرؤى",
    "description": "استكشف دليلك الشامل وأحدث المقالات المنشورة في المتجر",
    "isActive": true,
    "config": {
      "limit": 3,
      "blogCategoryId": "tech",
      "hasMargin": false,
      "margin": 0,
      "paddingY": 60,
      "titleStyle": "accent_bar",
      "titleAlign": "split",
      "titleSize": "lg",
      "badgeText": "✦ جديد المدونة",
      "cardRadius": "24px",
      "cardShadow": "lg",
      "cardElevation": "medium",
      "animation": {
        "type": "fade_up",
        "duration": 0.65,
        "once": true
      },
      "background": {
        "type": "gradient_linear",
        "gradientColors": ["#097E8A", "#1A2332"],
        "glowColor": "#097E8A",
        "dividerTop": "glow_line",
        "dividerBottom": "none"
      }
    }
  }
]
```

## 13. قسم الاشتراك بالنشرة البريدية والمميزات والركائز (`newsletter_signup`)

قسم النشرة البريدية يدعم الآن محرك العناوين الموحد بالكامل (`SectionHeader`)، بالإضافة إلى منظومة **المميزات والركائز (`pillars` / `features`)** ونصوص الأزرار وإخلاء المسؤولية:

```json
{
  "id": "newsletter_section",
  "type": "newsletter_signup",
  "title": "اشترك في نشرتنا البريدية",
  "description": "انضم إلى أكثر من 10,000 تاجر واستقبل أحدث الاستراتيجيات والعروض الحصرية",
  "config": {
    "titleStyle": "badge_header",
    "titleAlign": "center",
    "titleSize": "xl",
    "titleColor": "#ECC951",
    "subtitleColor": "#A0AEC0",
    "badgeText": "النشرة الأسبوعية",
    "badgeColor": "#ECC951",
    "badgeBg": "#1A2332",
    "hasMargin": false,
    "margin": 0,
    "paddingY": 60,
    "cardRadius": "xl",
    "cardShadow": "xl",
    "buttonText": "انضم الآن مجاناً",
    "placeholder": "أدخل بريدك الإلكتروني التجاري...",
    "disclaimer": "نحن نحترم خصوصيتك. لن نرسل أي رسائل مزعجة ويمكنك الإلغاء بضغطة زر.",
    "pillarsTitle": "ما الذي ستحصل عليه كمشترك؟",
    "pillarsLayout": "grid",
    "featuresPosition": "after_form",
    "pillars": [
      {
        "icon": "🚀",
        "title": "استراتيجيات نمو حصرية",
        "description": "مقالات وحلول تسويقية لا ننشرها في أي مكان آخر"
      },
      {
        "icon": "🎁",
        "title": "عروض وقسائم فورية",
        "description": "تخفيضات ومزايا حصرية لرواد الأعمال المشتركين"
      },
      {
        "icon": "🛡️",
        "title": "صفر رسائل مزعجة",
        "description": "رسالة واحدة أسبوعياً مركزة ومفيدة لوقتك"
      }
    ]
  }
}
```

* خيارات `pillarsLayout`:
  * `"grid"`: بطاقات ركائز أنيقة بأيقونة وعنوان ووصف.
  * `"chips"`: شرائح مدمجة ومميزة (Badges) مع أيقونة التحقق `✓`.
* خيارات `featuresPosition`:
  * `"after_form"` (افتراضي): تحت نموذج الاشتراك.
  * `"before_form"`: فوق نموذج الاشتراك.
* يمكن تمرير عناصر المميزات كمصفوفة نصوص بسيطة أو كائنات غنية:
  * نصوص بسيطة: `"features": ["بدون سبام", "محتوى أسبوعي", "إلغاء بأي وقت"]`
  * كائنات مفصلة: `"pillars": [{ "icon": "✨", "title": "...", "description": "..." }]`

---

## ١٤. محرك التأثيرات واللمسات البصرية فائقة العصرية (Ultra-Modern 2026 Visual Effects)

تم دمج أحدث تقنيات التصميم والتفاعل الميكروي (Micro-interactions) المعتمدة في كبرى الشركات العالمية (*Linear*, *Stripe*, *Vercel*, *Apple*)، وأصبحت جميعها مفعلة تلقائياً كقيم افتراضية مع إمكانية التحكم الكامل بها من لوحة تحكم الإدارة:

### جدول التحكم في التأثيرات العصرية من الـ Admin:

| التأثير العصري | الحقل في الـ `config` | نوع العنصر في واجهة الأدمن | القيم المدعومة | الشرح |
| :--- | :--- | :--- | :--- | :--- |
| **نوع الخط العربي** | `website.fontFamily` | **Select Dropdown** | `alexandria` (افتراضي: فخم وعصري جداً)<br>`ibm_plex` (تقني حديث)<br>`readex` (ناعم ومريح للقراءة)<br>`cairo` (كلاسيكي تقليدي)<br>`outfit` (لاتيني) | يغير الخط العربي الموحد في كامل الموقع فوراً. |
| **لمعة أزرار الـ CTA** | `buttonEffect` | **Select Dropdown** | `shimmer` (افتراضي: لمعة ضوئية سينمائية)<br>`glow` (توهج مشع)<br>`pulse` (نبض دوري خفيف)<br>`none` (ثابت) | لمعة ضوئية بيضاء شفافة تمر بانسيابية فوق الأزرار لجذب العين وزيادة معدل التحويل (CTR). |
| **حدود الكروت الزجاجية** | `cardStyle.borderStyle` | **Select Dropdown** | `gradient` (افتراضي: حدود عاكسة للضوء Linear Style)<br>`subtle` (حد خفيف ناعم)<br>`solid` (حد كلاسيكي مصمت)<br>`none` (بدون حدود) | تحيط الكروت بهالة ضوئية زجاجية تمنع المظهر المسطح أو الباهت. |
| **تفاعل الماوس على الكروت** | `cardStyle.hoverEffect` | **Select Dropdown** | `spotlight` (افتراضي: ارتداد ناعم وتوهج موضعي)<br>`lift` (ارتفاع للأعلى فقط)<br>`glow` (توهج ملون عند التمرير)<br>`none` | حركة تفاعلية ميكروية ثلاثية الأبعاد عند مرور مؤشر الماوس فوق أي كارت. |
| **شبكة الخلفية التكنولوجية** | `background.pattern` | **Select Dropdown** | `dots` (افتراضي: شبكة نقاط تكنولوجية خافتة)<br>`grid` (مربعات شبكية دقيقة)<br>`mesh` (توهجات ناعمة)<br>`none` (بدون شبكة) | تملأ الفراغات في خلفية السيكشن بنقاط دقيقة وأنيقة تعطي عمقاً بصرياً فخماً. |
| **طريقة العرض على الموبايل** | `mobileDisplayMode` | **Segmented Control** | `carousel` (افتراضي: شرائح تمرير أفقية Swipe)<br>`grid` (شبكة عمودية تقليدية) | على شاشات الهواتف، تحول كروت المنتجات والمميزات تلقائياً إلى كاروسيل أفقي ناعم بالإبهام لتفادي طول الصفحة المفرط. |
| **طفو موك أب الهاتف بالهيرو** | `floatingMockup` | **Switch / Checkbox** | `true` (افتراضي: طفو ناعم ثلاثي الأبعاد)<br>`false` (ثابت) | يجعل نموذج الهاتف في سيكشن الهيرو التفاعلي (`hero_saas_interactive`) يطفو بانسيابية ثلاثية الأبعاد. |

---

### نموذج JSON شامل لتطبيقه في لوحة التحكم:

```json
{
  "id": "web_sec_features",
  "type": "features",
  "title": "مميزات متجرنا",
  "isActive": true,
  "config": {
    "titleStyle": "accent_bar",
    "titleAlign": "center",
    "titleSize": "lg",

    "mobileDisplayMode": "carousel",
    "buttonEffect": "shimmer",
    "floatingMockup": true,

    "cardStyle": {
      "cardRadius": "20px",
      "cardShadow": "lg",
      "borderStyle": "gradient",
      "hoverEffect": "spotlight"
    },

    "background": {
      "type": "mesh_glow",
      "pattern": "dots"
    }
  }
}
```

---

## ١٥. محرك تنسيق محتوى تعريف الشركة والرؤية والرسالة (`about_company`)

تم ترقية محرك عرض محتوى سيكشن `about_company` (والمقالات الفردية) ليحافظ على التنسيق القادم من الـ Backend / الأدمن بنسبة 100%:

### المميزات الذكية التلقائية:
1. **التعرف الذكي على بطاقات (الرؤية / الرسالة / الأهداف / القيم)**:
   - عند كتابة `"الرؤية: ..."` و `"الرسالة: ..."` في محتوى المقال أو السيكشن، يقوم المحرك تلقائياً بفصلهما وتحويلهما إلى **بطاقات عصرية منفصلة (`aboutCardsGrid`)** مع أيقونات مناسبة (👁️ للرؤية، 🎯 للرسالة، 🚀 للأهداف، 💎 للقيم) بدلاً من تكدس النص في فقرة واحدة.
   - البطاقات متجاوبة تلقائياً (تظهر كعمودين متجاورين في الكمبيوتر، وكارتين فوق بعضهما في الموبايل مع إطار ناعم وتأثير تفاعلي عند التحويم).
2. **الحفاظ التام على فواصل الأسطر (Line Breaks Preservation)**:
   - تم تفعيل `white-space: pre-line`، مما يعني أن أي نزول لسطر جديد بالزر (Enter) في لوحة التحكم سيظهر في الموقع كسطر جديد حقيقي دون أن تندمج الكلمات معاً.
3. **دعم التنسيق الغني و HTML و Markdown**:
   - دعم كامل للفقرات، العناوين الفرعية، القوائم النقطية، والاقتباسات.

---
> تم تحديث وحفظ هذا الدليل في ملف: [`admin_config_guide.md`](file:///Users/moaz/Desktop/delta/products/saas%20products%20/matger-pro/matger-website/admin_config_guide.md).
