# 📄 Website Config — Developer Reference Guide
**للـ Web Developer (Next.js)**
*يُحفظ الـ config من لوحة التحكم (Flutter Admin) على الـ Backend عبر حقل `website` داخل `organizationConfig`*

---

## 🗂️ هيكل الـ JSON الكامل

```json
{
  "website": {
    "appMode": "hybrid",
    "logoStyle": "gradient",
    "navbarOrder": ["logo", "nav", "search", "tools"],
    "sections": [
      {
        "id": "web_intro",
        "type": "intro_slides",
        "title": "الشريحة التعريفية",
        "isActive": true,
        "displayMode": "slider",
        "config": {
          "introHybrid": {
            "displayStyle": "apple_fullscreen",
            "backgroundType": "gradient",
            "customBg": "linear-gradient(135deg, #100C1C, #1A2332)",
            "textColor": "#FFFFFF",
            "autoPlay": true,
            "duration": 4000,
            "indicatorType": "dots"
          },
          "introBlog": {
            "displayStyle": "minimal_glass",
            "backgroundType": "solid",
            "customBg": "#0F172A",
            "textColor": "#F8FAFC",
            "autoPlay": false,
            "indicatorType": "pills"
          },
          "introStore": {
            "displayStyle": "full_split",
            "backgroundType": "gradient",
            "customBg": "linear-gradient(135deg, #1A2332, #0D47A1)",
            "textColor": "#FFFFFF",
            "autoPlay": true,
            "duration": 3000,
            "indicatorType": "none"
          }
        }
      },
      {
        "id": "web_offers",
        "type": "offers",
        "title": "العروض",
        "isActive": true,
        "displayMode": "slider",
        "config": { "autoPlay": true }
      },
      {
        "id": "web_categories",
        "type": "categories",
        "title": "التصنيفات",
        "isActive": true,
        "displayMode": "horizontal_list",
        "config": {}
      },
      {
        "id": "web_new_products",
        "type": "new_products",
        "title": "وصل حديثاً",
        "isActive": true,
        "displayMode": "grid",
        "config": { "crossAxisCount": 4 }
      },
      {
        "id": "web_blog_posts",
        "type": "blog_posts",
        "title": "أحدث المقالات",
        "isActive": true,
        "displayMode": "grid",
        "config": { "limit": 3 }
      }
    ],
    "footer": {
      "description": "وصف المتجر",
      "address": "العنوان",
      "phone": "+966501234567",
      "email": "info@store.com",
      "trustBadge": "مرخص وآمن بنسبة 100%",
      "copyright": "© 2026 متجر برو. جميع الحقوق محفوظة."
    },
    "socialMedia": {
      "facebook": "https://facebook.com/storepage",
      "telegram": "https://t.me/storechannel",
      "whatsapp": "+966501234567"
    }
  }
}
```

---

## 1️⃣ `appMode` — وضع التطبيق

**المفتاح:** `config.website.appMode`

| القيمة   | المعنى                                    |
|----------|-------------------------------------------|
| `"blog"` | المدونة فقط — أخفِ كل عناصر المتجر       |
| `"store"`| المتجر فقط — أخفِ كل عناصر المدونة       |
| `"hybrid"`| الاثنين معاً (القيمة الافتراضية)         |

**كيفية الاستخدام في Next.js:**

```typescript
// AppContext.tsx
// الـ config يأخذ الأولوية على الـ localStorage
const savedMode = localStorage.getItem("appMode") as AppMode | null;
const configMode = (orgConfig.website?.appMode as AppMode) ?? null;
const initialMode = configMode ?? savedMode ?? "hybrid";
setAppModeState(initialMode);
```

> ⚠️ **ملاحظة:** لو `config.website.appMode` موجود، يأخذ الأولوية.
> لو مش موجود، يرجع لـ localStorage. لو فارغ → `"hybrid"`.

---

## 2️⃣ `logoStyle` — تنسيق الشعار في النافبار

**المفتاح:** `config.website.logoStyle`

| القيمة      | المعنى                                                     |
|-------------|------------------------------------------------------------|
| `"solid"`   | لون صريح — يأخذ لون `var(--primary)` من الثيم             |
| `"gradient"`| تدرج لوني — من `var(--primary)` إلى `var(--secondary)`   |

**كيفية الاستخدام:**

```tsx
// Navbar.tsx
const logoStyle = config?.website?.logoStyle ?? "solid";

const logoTextStyle: React.CSSProperties =
  logoStyle === "gradient"
    ? {
        background: "linear-gradient(135deg, var(--primary), var(--secondary))",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }
    : { color: "var(--primary)" };

// في الـ JSX:
<span className={styles.logoText} style={logoTextStyle}>
  {appTitle}
</span>
```

---

## 3️⃣ `navbarOrder` — ترتيب عناصر شريط التنقل

**المفتاح:** `config.website.navbarOrder`
**النوع:** `string[]`
**القيمة الافتراضية:** `["logo", "nav", "search", "tools"]`

| المفتاح   | العنصر                                      |
|-----------|---------------------------------------------|
| `"logo"`  | الشعار واسم التطبيق                          |
| `"nav"`   | روابط التنقل الرئيسية                        |
| `"search"`| أيقونة/شريط البحث                            |
| `"tools"` | السلة، المستخدم، اللغة، تبديل الثيم          |

**كيفية الاستخدام:**

```tsx
// Navbar.tsx
const navbarOrder: string[] =
  (config?.website?.navbarOrder as string[]) ??
  ["logo", "nav", "search", "tools"];

const navElements: Record<string, React.ReactNode> = {
  logo:   <LogoBlock />,
  nav:    <NavLinks />,
  search: <SearchBar />,
  tools:  <NavTools />,  // cart + user + lang + theme toggle
};

// في الـ render:
<nav className={styles.navbar}>
  {navbarOrder.map((key) => (
    <React.Fragment key={key}>
      {navElements[key] ?? null}
    </React.Fragment>
  ))}
</nav>
```

---

## 4️⃣ `sections` — أقسام الصفحة الرئيسية

**المفتاح:** `config.website.sections`
**النوع:** `Array<WebsiteSection>`

كل section فيه:

| الحقل         | النوع      | الوصف                              |
|---------------|------------|------------------------------------|
| `id`          | `string`   | معرف فريد                          |
| `type`        | `string`   | نوع المحتوى (انظر الجدول أدناه)    |
| `title`       | `string?`  | عنوان القسم                        |
| `isActive`    | `boolean`  | مفعّل أم لا                        |
| `displayMode` | `string`   | `grid` / `slider` / `horizontal_list` |
| `config`      | `object`   | إعدادات تفصيلية لكل نوع            |

### أنواع الـ `type`:

| `type`             | الوصف                                      |
|--------------------|--------------------------------------------|
| `"intro_slides"`   | الهيرو/السلايدر — له 3 configs منفصلة      |
| `"offers"`         | العروض والخصومات                           |
| `"categories"`     | التصنيفات                                  |
| `"new_products"`   | المنتجات الجديدة                           |
| `"best_seller"`    | الأكثر مبيعاً                             |
| `"blog_posts"`     | أحدث المقالات                              |
| `"most_read_posts"`| المقالات الأكثر قراءة                     |
| `"jocker_post"`    | المقال/المنتج المميز                       |
| `"custom_banner"`  | بانر مخصص بصورة ورابط                     |

---

## 5️⃣ `intro_slides` config — الأهم

لهذا النوع تحديداً، الـ `config` يحتوي على **3 كائنات منفصلة**:

```
config.introHybrid  →  يُستخدم عند appMode = "hybrid"
config.introBlog    →  يُستخدم عند appMode = "blog"
config.introStore   →  يُستخدم عند appMode = "store"
```

### حقول كل كائن:

| الحقل           | القيم المتاحة                                                         | الافتراضي          |
|-----------------|-----------------------------------------------------------------------|--------------------|
| `displayStyle`  | `"apple_fullscreen"` / `"minimal_glass"` / `"full_split"` / `"classic_centered"` | `"apple_fullscreen"` |
| `backgroundType`| `"solid"` / `"gradient"`                                             | `"solid"`          |
| `customBg`      | hex مثل `#1A2332` أو CSS gradient string                             | `""`               |
| `textColor`     | hex مثل `#FFFFFF`                                                    | `""`               |
| `autoPlay`      | `true` / `false`                                                      | `true`             |
| `duration`      | رقم بالـ ms — من `2000` إلى `8000`                                  | `4000`             |
| `indicatorType` | `"pills"` / `"dots"` / `"none"`                                      | `"dots"`           |

### شرح `displayStyle`:

| القيمة               | الشكل                                               |
|----------------------|-----------------------------------------------------|
| `"apple_fullscreen"` | صورة ملء الشاشة + نص overlay شفاف                  |
| `"minimal_glass"`    | نص داخل glassmorphic card فوق خلفية ضبابية          |
| `"full_split"`       | الشاشة مقسومة — صورة 50% + نص 50%                 |
| `"classic_centered"` | نص وزر في المنتصف فوق خلفية بسيطة                  |

### كيفية الاستخدام:

```typescript
// utils/introConfig.ts
export function getIntroConfig(
  websiteConfig: Record<string, any> | undefined,
  appMode: string
) {
  const section = (websiteConfig?.sections ?? []).find(
    (s: any) => s.type === "intro_slides" && s.isActive !== false
  );
  if (!section) return null;

  const keyMap: Record<string, string> = {
    hybrid: "introHybrid",
    blog:   "introBlog",
    store:  "introStore",
  };
  const key = keyMap[appMode] ?? "introHybrid";
  return (section.config?.[key] ?? {}) as IntroSlideConfig;
}
```

```tsx
// HeroSection.tsx (أو StoreHero.tsx)
const introConfig = getIntroConfig(config?.website, appMode);

const bgStyle: React.CSSProperties = introConfig?.customBg
  ? { background: introConfig.customBg }
  : {};

const textStyle: React.CSSProperties = introConfig?.textColor
  ? { color: introConfig.textColor }
  : {};

switch (introConfig?.displayStyle) {
  case "apple_fullscreen":
    return <AppleFullscreenHero config={introConfig} />;
  case "minimal_glass":
    return <GlassHero config={introConfig} />;
  case "full_split":
    return <SplitHero config={introConfig} />;
  case "classic_centered":
    return <ClassicHero config={introConfig} />;
  default:
    return <AppleFullscreenHero config={introConfig} />;
}
```

---

## 6️⃣ config الأقسام الأخرى

### `offers` — العروض
```json
{ "autoPlay": true }
```

### `categories` — التصنيفات
```json
{}
```

### `new_products` / `best_seller` — المنتجات
```json
{ "crossAxisCount": 4 }
```
- `crossAxisCount`: عدد الأعمدة في الشبكة → `2` / `3` / `4`

### `blog_posts` / `most_read_posts` — المقالات
```json
{ "limit": 3 }
```
- `limit`: عدد المقالات المعروضة → `3` / `6` / `9`

### `jocker_post` — المميز
```json
{
  "imageCount": 1,
  "fullScreen": false,
  "margin": 16
}
```

### `custom_banner` — بانر مخصص
```json
{
  "imageUrl": "https://...",
  "linkUrl": "/products"
}
```

---

## 7️⃣ `displayMode` — طريقة العرض

| القيمة              | المعنى                             |
|---------------------|------------------------------------|
| `"grid"`            | شبكة — استخدم `crossAxisCount`    |
| `"slider"`          | كاروسيل/سلايدر أفقي               |
| `"horizontal_list"` | قائمة أفقية قابلة للتمرير         |

---

## ⚡ منطق الـ Fallback والأولوية

```
config.website.appMode
  ↓ موجود   → يُستخدم كـ default لـ appMode
  ↓ غير موجود → يرجع لـ localStorage["appMode"]
  ↓ فارغ    → "hybrid"

config.website.sections
  ↓ موجود   → يُستخدم
  ↓ غير موجود → defaultSections حسب appMode

intro config key
  ↓ introHybrid / introBlog / introStore موجود → يُستخدم
  ↓ غير موجود → {} (الـ component يعرض الـ default الخاص به)
```

---

## 📌 جدول مرجعي سريع للـ Keys

| الـ Key                          | يوجد في                                    |
|----------------------------------|--------------------------------------------|
| `website.appMode`                | `config.website`                           |
| `website.logoStyle`              | `config.website`                           |
| `website.navbarOrder`            | `config.website`                           |
| `website.sections`               | `config.website`                           |
| `website.footer`                 | `config.website`                           |
| `website.socialMedia`            | `config.website`                           |
| `section.config.introHybrid`     | داخل section من نوع `intro_slides`        |
| `section.config.introBlog`       | داخل section من نوع `intro_slides`        |
| `section.config.introStore`      | داخل section من نوع `intro_slides`        |
| `section.config.crossAxisCount`  | داخل sections المنتجات                    |
| `section.config.limit`           | داخل sections المقالات                    |
| `section.config.autoPlay`        | داخل sections العروض والسلايدر             |

---

## 📝 TypeScript Types Reference

```typescript
// أضف هذا في src/types/index.ts

type AppMode = "blog" | "store" | "hybrid";
type LogoStyle = "solid" | "gradient";
type DisplayMode = "grid" | "slider" | "horizontal_list";
type IntroDisplayStyle = "apple_fullscreen" | "minimal_glass" | "full_split" | "classic_centered";
type BackgroundType = "solid" | "gradient";
type IndicatorType = "pills" | "dots" | "none";

interface IntroSlideConfig {
  displayStyle?: IntroDisplayStyle;
  backgroundType?: BackgroundType;
  customBg?: string;
  textColor?: string;
  autoPlay?: boolean;
  duration?: number;
  indicatorType?: IndicatorType;
}

interface WebsiteSection {
  id: string;
  type: string;
  title?: string;
  isActive?: boolean;
  displayMode?: DisplayMode;
  config?: {
    // intro_slides
    introHybrid?: IntroSlideConfig;
    introBlog?: IntroSlideConfig;
    introStore?: IntroSlideConfig;
    // products / categories
    crossAxisCount?: 2 | 3 | 4;
    // blog posts
    limit?: number;
    // offers / sliders
    autoPlay?: boolean;
    // jocker post
    imageCount?: number;
    fullScreen?: boolean;
    margin?: number;
    // custom banner
    imageUrl?: string;
    linkUrl?: string;
  };
}

interface WebsiteConfig {
  appMode?: AppMode;
  logoStyle?: LogoStyle;
  navbarOrder?: string[];
  sections?: WebsiteSection[];
  footer?: {
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    trustBadge?: string;
    copyright?: string;
  };
  socialMedia?: {
    facebook?: string;
    telegram?: string;
    whatsapp?: string;
  };
}
```
