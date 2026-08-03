# خطة عمل الموقع الإلكتروني (Next.js Storefront)
### التحكم في شريط التنقل وفصل تصنيفات المتجر والمدونة

توضح هذه الخطة الخطوات البرمجية والأكواد المطلوبة لتطبيق ميزات التحكم بالروابط الزائدة (More Dropdown) وفصل تصنيفات المتجر والمدونة في الـ Header والـ Footer بناءً على إعدادات لوحة التحكم المستلمة من الباك اند.

---

## 1️⃣ تحديث الـ Types والواجهة (`src/types/index.ts`)
تحديث واجهة `WebsiteConfig` لتشمل الخصائص الجديدة المستلمة من الـ API:
```typescript
export interface WebsiteConfig {
  sections?: any[];
  appMode?: 'hybrid' | 'blog' | 'store';
  logoStyle?: 'solid' | 'gradient';
  navbarOrder?: string[];
  // الإعدادات الجديدة المضافة للتحكم:
  excessLinksMode?: 'dropdown' | 'sidebar';
  showStoreCategoriesInNavbar?: boolean;
  showBlogCategoriesInNavbar?: boolean;
  showStoreCategoriesInFooter?: boolean;
  showBlogCategoriesInFooter?: boolean;
}
```

---

## 2️⃣ فصل وتنسيق التصنيفات في الفوتر (`src/components/Footer/Footer.tsx`)
بدلاً من خلط تصنيفات المتجر والمدونة معاً في الوضع الهجين (Hybrid)، سنفصلهم إلى عمودين أو قائمتين منفصلتين مع إمكانية إخفائهما أو إظهارهما بناءً على إعدادات الأدمن:
```tsx
{/* في حال الوضع الهجين (Hybrid Mode) وفصل الفئات */}
{appMode === "hybrid" && (
  <>
    {config?.website?.showStoreCategoriesInFooter !== false && productCategories.length > 0 && (
      <div className={styles.column}>
        <h3 className={styles.columnTitle}>{lang === "ar" ? "تصنيفات المتجر" : "Store Categories"}</h3>
        <ul className={styles.linksList}>
          {productCategories.slice(0, 5).map((c) => (
            <li key={c.id}><Link href={`/store?category=${c.id}`}>{c.name}</Link></li>
          ))}
        </ul>
      </div>
    )}
    
    {config?.website?.showBlogCategoriesInFooter !== false && categories.length > 0 && (
      <div className={styles.column}>
        <h3 className={styles.columnTitle}>{lang === "ar" ? "تصنيفات المدونة" : "Blog Categories"}</h3>
        <ul className={styles.linksList}>
          {categories.slice(0, 5).map((c) => (
            <li key={c.id}><Link href={`/blog?category=${c.id}`}>{c.name}</Link></li>
          ))}
        </ul>
      </div>
    )}
  </>
)}
```

---

## 3️⃣ تعديل الـ Navbar لعرض "المزيد" وتصنيفات المتجر والمدونة (`src/components/Navbar/Navbar.tsx`)

### أ. جلب التصنيفات للـ Navbar:
سنضيف `categories` و `productCategories` إلى التفكيك (Destructuring) المستدعى من `useApp()` في أعلى ملف المكون.

### ب. تطبيق منطق الروابط الزائدة (Excess Links):
سنحدد حداً أقصى للروابط المعروضة مباشرة في الـ Navbar (مثلاً 4 روابط مخصصة)، والباقي يتم التعامل معه بناءً على خيار الأدمن:
```tsx
const EXCESS_THRESHOLD = 4;
const visiblePages = navPages.slice(0, EXCESS_THRESHOLD);
const excessPages = navPages.slice(EXCESS_THRESHOLD);
const excessMode = config?.website?.excessLinksMode ?? 'dropdown';
```
في جزء الـ HTML (داخل المكون):
```tsx
{/* عرض الروابط الأساسية والمرئية */}
{visiblePages.map((page) => (
  <Link key={page.id} href={`/${page.slug}`} className={styles.navLink}>
    {page.title}
  </Link>
))}

{/* إذا كانت هناك روابط زائدة ومفعل خيار القائمة المنسدلة */}
{excessPages.length > 0 && excessMode === 'dropdown' && (
  <div className={styles.dropdownContainer}>
    <button className={styles.navLink}>
      {lang === "ar" ? "المزيد ▾" : "More ▾"}
    </button>
    <div className={styles.dropdownMenu}>
      {excessPages.map((page) => (
        <Link key={page.id} href={`/${page.slug}`} className={styles.dropdownItem}>
          {page.title}
        </Link>
      ))}
    </div>
  </div>
)}
```

### ج. عرض قوائم التصنيفات المنسدلة في الـ Navbar (Dropdowns):
إذا كان خيار الأدمن لعرض التصنيفات في الهيدر مفعلاً، فسنعرضها كقوائم منسدلة منسقة بجانب رابط المتجر والمدونة:
```tsx
{/* قائمة تصنيفات المتجر المنسدلة */}
{config?.website?.showStoreCategoriesInNavbar && productCategories.length > 0 && (
  <div className={styles.dropdownContainer}>
    <button className={styles.navLink}>
      {lang === "ar" ? "أقسام المتجر ▾" : "Store Sections ▾"}
    </button>
    <div className={styles.dropdownMenu}>
      {productCategories.map((cat) => (
        <Link key={cat.id} href={`/store?category=${cat.id}`} className={styles.dropdownItem}>
          {cat.name}
        </Link>
      ))}
    </div>
  </div>
)}

{/* قائمة تصنيفات المدونة المنسدلة */}
{config?.website?.showBlogCategoriesInNavbar && categories.length > 0 && (
  <div className={styles.dropdownContainer}>
    <button className={styles.navLink}>
      {lang === "ar" ? "أقسام المدونة ▾" : "Blog Sections ▾"}
    </button>
    <div className={styles.dropdownMenu}>
      {categories.map((cat) => (
        <Link key={cat.id} href={`/blog?category=${cat.id}`} className={styles.dropdownItem}>
          {cat.name}
        </Link>
      ))}
    </div>
  </div>
)}
```

---

## 4️⃣ تحسينات الـ CSS للـ Dropdowns (`Navbar.module.css`)
إضافة التنسيقات للقوائم المنسدلة لتظهر بشكل ناعم واحترافي بمحاذاة مناسبة للغات العربي والإنجليزي:
```css
.dropdownContainer {
  position: relative;
  display: inline-block;
}

.dropdownMenu {
  display: none;
  position: absolute;
  top: 100%;
  inset-inline-start: 0;
  background-color: var(--surface);
  min-width: 180px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.1);
  border-radius: 8px;
  padding: 0.5rem 0;
  z-index: 10;
  border: 1px solid var(--divider);
}

.dropdownContainer:hover .dropdownMenu {
  display: block;
}

.dropdownItem {
  color: var(--fg);
  padding: 0.5rem 1rem;
  text-decoration: none;
  display: block;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.dropdownItem:hover {
  background-color: var(--surfaceVariant);
  color: var(--primary);
}

---

## 5️⃣ إظهار وصف السكاشن (Section Subtitles) في الصفحة الرئيسية
نقوم بتحديث المكونات في الصفحة الرئيسية لتتمكن من قراءة حقل الـ `description` للسكشن وعرضه كعنوان فرعي تحت العنوان الرئيسي للقسم.
في ملف `src/app/page.tsx` داخل دالة `renderSection`:
تعديل كود الهيدر لكل قسم ليصبح كالتالي:
```tsx
<div className={styles.sectionHeader}>
  <div className={styles.titleArea}>
    <h2 className={styles.sectionTitle}>{section.title || defaultTitle}</h2>
    {section.description && (
      <p className={styles.sectionSubtitle}>{section.description}</p>
    )}
  </div>
  <Link href="/blog" className={styles.viewAllBtn}>
    {lang === "ar" ? "عرض الكل" : "View All"} {lang === "ar" ? "←" : "→"}
  </Link>
</div>
```

وتحديث الـ CSS المناسب في `src/app/Home.module.css`:
```css
.titleArea {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sectionSubtitle {
  font-size: 0.9rem;
  color: var(--fg-muted, #888);
  margin: 0;
}
```

---

## 6️⃣ إضافة قسم التعريف بالشركة / مقال كامل مستقل (`about_company`)
لعرض مقال كامل مستقل (مثل مقال تعريفي بالشركة) كقسم في الصفحة الرئيسية بناءً على الـ Slug المختار، مع التحكم بموقع الصورة (أعلى، أسفل، يمين، يسار).

أضف الكود التالي في ملف `src/app/page.tsx` داخل دالة `renderSection`:
```tsx
// 7. ABOUT COMPANY / SINGLE POST (مقال كامل مستقل)
if (sType === "about_company" && appMode !== "store") {
  const slug = section.config?.postSlug;
  if (!slug) return null;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return null;
  
  const titleStr = typeof post.title === "string" ? post.title : post.title?.[lang as any] || post.title?.ar || "";
  const contentStr = typeof post.content === "string" ? post.content : post.content?.[lang as any] || post.content?.ar || "";
  const imgUrl = post.imageUrl || (post as any).image;
  
  // موضع الصورة المحدد (يسار افتراضياً)
  const imgPosition = section.config?.imagePosition ?? 'left'; 
  const contentClass = `${styles.aboutCompanyContent} ${styles[`imgPos_${imgPosition}`]}`;
  
  return wrapInLayout(
    <section key={section.id} className={styles.aboutCompanySectionBlock}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleArea}>
          <h2 className={styles.sectionTitle}>{section.title || titleStr}</h2>
          {section.description && (
            <p className={styles.sectionSubtitle}>{section.description}</p>
          )}
        </div>
      </div>
      <div className={contentClass}>
        {imgUrl && (
          <div className={styles.aboutCompanyImageWrapper}>
            <img src={imgUrl} alt={titleStr} className={styles.aboutCompanyImage} />
          </div>
        )}
        <div className={styles.aboutCompanyText}>
          {contentStr.split("\n\n").map((paragraph, idx) => (
            <p key={idx} className={styles.aboutParagraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
```

تعديلات الـ CSS في `src/app/Home.module.css`:
```css
.aboutCompanySectionBlock {
  margin: 3rem 0;
  width: 100%;
}

.aboutCompanyContent {
  display: flex;
  gap: 2rem;
  margin-top: 1.5rem;
  align-items: center;
}

/* التحكم باتجاه العناصر (موضع الصورة) */
.imgPos_left {
  flex-direction: row;
}

.imgPos_right {
  flex-direction: row-reverse;
}

.imgPos_top {
  flex-direction: column;
  align-items: flex-start;
}

.imgPos_bottom {
  flex-direction: column-reverse;
  align-items: flex-start;
}

.imgPos_top .aboutCompanyImageWrapper,
.imgPos_bottom .aboutCompanyImageWrapper {
  width: 100%;
  max-height: 400px;
}

.aboutCompanyImageWrapper {
  flex: 1;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.aboutCompanyImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.aboutCompanyText {
  flex: 1.5;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--fg);
}

.aboutParagraph {
  margin: 0;
  text-align: justify;
}

@media (max-width: 767px) {
  /* الموبايل يظهر الصورة في الأعلى دائماً للتوافقية */
  .aboutCompanyContent {
    flex-direction: column !important;
  }
}
```

---

## 7️⃣ تنسيق هيكل القسم (Boxed Container & Shadow)
للتحكم في شكل القسم بالكامل (هل يكون صندوقياً بظل، أم ممتداً على خلفية الموقع):

في ملف `src/app/page.tsx` داخل دالة `renderSection`:
نقوم بتعريف دالة مغلفة `wrapInLayout` في البداية لتطبيق التنسيق الصندوقي والظل على المخرجات:
```tsx
const renderSection = (section: any) => {
  const sType = (section.type || "").toLowerCase().trim();
  
  const isBoxed = section.config?.boxedLayout === true;
  const hasShadow = section.config?.hasShadow === true;
  
  // مغلف لتطبيق الصندوقية والظل ديناميكياً
  const wrapInLayout = (content: React.ReactNode) => {
    if (!isBoxed) return content;
    return (
      <div key={`wrap-${section.id}`} className={`${styles.boxedSection} ${hasShadow ? styles.shadowSection : ''}`}>
        {content}
      </div>
    );
  };
  
  // نقوم بتمرير المخرجات عبر wrapInLayout() لكل قسم
  // مثال:
  if (sType === "blog_posts") {
    return wrapInLayout(
      <div key={section.id} id="blog-sec" className={styles.blogSectionBlock}>
        ...
      </div>
    );
  }
  
  // ... إلخ لجميع السكاشن
}
```

أضف التنسيق التالي في `src/app/Home.module.css`:
```css
.boxedSection {
  max-width: 1200px;
  margin: 2.5rem auto;
  padding: 2.5rem;
  background-color: var(--surface);
  border-radius: 16px;
  border: 1px solid var(--divider);
  transition: box-shadow 0.3s ease;
}

.shadowSection {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.02);
}
```

---

## 8️⃣ الأقسام الجديدة (الأسئلة الشائعة، التقييمات، الشحن والدفع، النشرة البريدية)
تطبيق كود المكونات التفاعلية للأقسام الجديدة في `src/app/page.tsx`:

```tsx
// 8. FAQS (الأسئلة الشائعة)
if (sType === "faqs") {
  const items = section.config?.items || [];
  return wrapInLayout(
    <section key={section.id} className="faqs-block my-12">
      {items.map((item: any, i: number) => (
        <details key={i} className="faq-item">
          <summary className="font-bold cursor-pointer">{item.question}</summary>
          <p className="mt-2 text-gray-600">{item.answer}</p>
        </details>
      ))}
    </section>
  );
}

// 9. TESTIMONIALS (آراء وتقييمات العملاء)
if (sType === "testimonials") {
  return wrapInLayout(
    <section key={section.id} className="testimonials-block my-12">
      <TestimonialsSection />
    </section>
  );
}

// 10. TRUST BADGES (ثقة وضمان الشحن والدفع)
if (sType === "trust_badges") {
  const items = section.config?.items || [];
  return wrapInLayout(
    <section key={section.id} className="trust-badges-block my-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((item: any, i: number) => (
        <div key={i} className="badge-card flex items-start gap-4 p-4 border rounded-lg">
          {/* يمكن للمطور مطابقة رمز الأيقونة (item.icon) مع مكتبة react-icons */}
          <div className="text-xl text-primary">{item.icon}</div>
          <div>
            <h3 className="font-bold">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.description}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

// 11. NEWSLETTER SIGNUP (الاشتراك بالنشرة البريدية)
if (sType === "newsletter_signup") {
  return wrapInLayout(
    <section key={section.id} className="newsletter-block my-12">
      <NewsletterSignupSection />
    </section>
  );
}
```
```
