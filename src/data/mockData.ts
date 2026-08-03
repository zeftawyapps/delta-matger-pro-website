// TODO (Refactor): Move model interfaces to domain types (types/index.ts) or separate entity files
export interface LocalizedText {
  ar: string;
  en: string;
}

export interface Author {
  name: LocalizedText;
  avatar: string;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  category: LocalizedText;
  categoryLabel: LocalizedText;
  date: string;
  readTime: number;
  author: Author;
  image: string;
  featured?: boolean;
  content: LocalizedText;
}

export interface SpecItem {
  name: string;
  value: string;
}

export interface Specs {
  ar: SpecItem[];
  en: SpecItem[];
}

export interface Product {
  id: number;
  name: LocalizedText;
  price: number;
  rating: number;
  reviewsCount: number;
  category: string;
  categoryLabel: LocalizedText;
  image: string;
  description: LocalizedText;
  colors?: string[];
  sizes?: string[];
  specs: Specs;
}

export interface Testimonial {
  id: number;
  name: LocalizedText;
  role: LocalizedText;
  avatar: string;
  feedback: LocalizedText;
}

export interface Faq {
  id: number;
  question: LocalizedText;
  answer: LocalizedText;
}

// TODO (Refactor): Move to blog mock datasource (datasources/mocks/mock_posts.ts)
export const mockPosts: BlogPost[] = [
  {
    id: 1,
    slug: "future-of-ai-2026",
    title: {
      ar: "مستقبل الذكاء الاصطناعي في عام 2026 وما بعده",
      en: "The Future of AI in 2026 and Beyond"
    },
    description: {
      ar: "كيف سيعيد الذكاء الاصطناعي تشكيل مجالات العمل والتعليم والبرمجة في السنوات القادمة.",
      en: "How AI is reshaping work, education, and software development in the coming years."
    },
    category: { ar: "تقنية", en: "tech" },
    categoryLabel: { ar: "أحدث التقنيات", en: "Tech Trends" },
    date: "2026-06-15",
    readTime: 5,
    author: {
      name: { ar: "أنس أحمد", en: "Anas Ahmed" },
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
    },
    image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800",
    featured: true,
    content: {
      ar: `الذكاء الاصطناعي لم يعد مجرد أداة مساعدة، بل أصبح ركيزة أساسية في كافة القطاعات الرقمية. بحلول عام 2026، نشهد تحولاً جذرياً نحو الوكلاء الذاتيين (Agentic AI) الذين لا يكتفون بالإجابة على الأسئلة فحسب، بل ينجزون المهام المعقدة بالكامل نيابة عن المستخدمين.

هذا التحول يعيد تشكيل سوق العمل والمهارات المطلوبة. لم يعد المبرمج مثلاً بحاجة لكتابة الكود السطحي المتكرر، بل يركز على التصميم المعماري للأنظمة وإدارة الوكلاء الأذكياء.

أهم التغييرات المتوقعة:
1. أنظمة برمجية ذاتية الإصلاح والتطوير.
2. واجهات مستخدم ديناميكية تتشكل حسب رغبة المستخدم وحاجته اللحظية.
3. تكامل عميق مع الأجهزة الذكية القابلة للارتداء ونظارات الواقع المعزز.

البقاء في هذا العصر يتطلب المرونة والتعلم المستمر وتطوير المهارات القيادية والتفكير النقدي لتوجيه هذه الآلات بذكاء.`,
      en: `Artificial Intelligence is no longer just an assistant tool; it has become a fundamental pillar in all digital sectors. In 2026, we are witnessing a radical shift toward Agentic AI—agents that don't just answer queries but execute complex tasks autonomously on behalf of users.

This transition reshapes the job market and required skill sets. Developers, for instance, no longer write repetitive boilerplate code. Instead, they focus on system architecture and orchestrating smart agents.

Key expected shifts:
1. Self-healing and auto-evolving software systems.
2. Dynamic user interfaces that adapt to user intent on the fly.
3. Deep integration with wearable devices and AR glasses.

Thriving in this era requires agility, continuous learning, and fostering leadership and critical thinking to guide these machines intelligently.`
    }
  },
  {
    id: 2,
    slug: "mastering-css-modules",
    title: {
      ar: "احتراف تصميم المواقع باستخدام CSS Modules",
      en: "Mastering Web Layouts with CSS Modules"
    },
    description: {
      ar: "دليلك الشامل لتنظيم التنسيقات وعزلها وتجنب تداخل الأنماط في مشاريع React و Next.js.",
      en: "Your comprehensive guide to scoping styles and avoiding conflicts in React and Next.js projects."
    },
    category: { ar: "تصميم", en: "design" },
    categoryLabel: { ar: "التصميم البصري", en: "Design UX" },
    date: "2026-06-12",
    readTime: 4,
    author: {
      name: { ar: "منى يوسف", en: "Mona Youssef" },
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    },
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800",
    featured: false,
    content: {
      ar: `عند بناء تطبيقات ويب كبيرة، يواجه المطورون غالباً مشكلة تداخل أنماط CSS وتأثيرها على عناصر غير مقصودة. هنا يأتي دور CSS Modules كحل مدمج وممتاز داخل إطار العمل Next.js.

من خلال إنشاء ملفات مثل Navbar.module.css، يضمن المطور أن جميع الفئات المكتوبة فيه سيتم توليد أسماء عشوائية فريدة لها أثناء البناء، مما يقضي على التعارضات تماماً.

لماذا يفضل المطورون CSS Modules على Tailwind في بعض المشاريع؟
1. حرية كاملة في كتابة الأنماط المعقدة وتأثيرات Hover والانتقالات دون قيود.
2. عزل تام وتسهيل عملية الصيانة دون تضخم ملفات HTML.
3. دعم كامل للميزات الحديثة مثل المتغيرات والدوال الرياضية ونقاط الحاويات (Container Queries).`,
      en: `When building large-scale web applications, developers frequently encounter CSS style conflicts where selectors accidentally overwrite each other. CSS Modules offer a native, excellent solution in Next.js.

By creating files like Navbar.module.css, developers ensure that all class names are hashed and generated uniquely at build time, completely resolving layout collisions.

Why developers choose CSS Modules over Tailwind CSS for premium projects:
1. Complete design control to write intricate styling, hover effects, and keyframes without bounds.
2. Strict isolation which simplifies refactoring without inflating the HTML templates.
3. Full support for modern CSS specs like custom properties, clamp functions, and container queries.`
    }
  },
  {
    id: 3,
    slug: "rust-vs-go-backend-2026",
    title: {
      ar: "مقارنة بين Rust و Go لبناء الخدمات الخلفية",
      en: "Rust vs Go for Backend Development in 2026"
    },
    description: {
      ar: "دراسة مقارنة للأداء وسرعة التطوير والأمان لاختيار اللغة الأنسب لمشروعك القادم.",
      en: "A comparative study of performance, development speed, and safety to choose the right backend language."
    },
    category: { ar: "برمجة", en: "coding" },
    categoryLabel: { ar: "البرمجة والتطوير", en: "Coding & Dev" },
    date: "2026-06-08",
    readTime: 6,
    author: {
      name: { ar: "خالد سعيد", en: "Khaled Said" },
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
    },
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800",
    featured: false,
    content: {
      ar: `اختيار لغة البرمجة لبناء الخوادم (Backend) يحدد مصير واستقرار البنية التحتية لتطبيقك. في هذا المقال، نقارن بين لغتين شهيرتين: Go البسيطة و Rust الآمنة فائقة السرعة.

تتميز لغة Go بمنحنى تعلم مسطح وسرعة كتابة كود مذهلة ونظام إدارة المهام المتزامنة (Goroutines) المدمج والفعال للغاية، مما يجعلها مثالية للشركات الناشئة والخدمات المصغرة (Microservices).

من ناحية أخرى، تقدم Rust نظام ملكية صارم يضمن أمان الذاكرة في وقت البناء (Compile time) دون الحاجة لجامع القمامة (Garbage Collector)، مما يعطيها تفوقاً حاسماً في استهلاك الموارد وسرعة الاستجابة تحت الضغط العالي.`,
      en: `Choosing a backend language dictates the stability and performance of your application. In this article, we pit Go (simplicity and rapid creation) against Rust (type safety and extreme raw speed).

Go shines with a flat learning curve, high compilation speed, and its built-in concurrency model (Goroutines), making it highly effective for startups and microservices.

On the other hand, Rust offers a strict ownership model that guarantees memory safety at compile time without a Garbage Collector, resulting in unrivaled resource efficiency and response times under high-concurrency loads.`
    }
  },
  {
    id: 4,
    slug: "healthy-lifestyle-remote-workers",
    title: {
      ar: "كيف تحافظ على نمط حياة صحي أثناء العمل عن بعد",
      en: "How to Live Healthy While Working Remotely"
    },
    description: {
      ar: "نصائح عملية للحفاظ على لياقتك البدنية وصحتك العقلية وتجنب الخمول المنزلي.",
      en: "Practical tips to maintain physical fitness, mental health, and avoid home-office fatigue."
    },
    category: { ar: "نمط حياة", en: "lifestyle" },
    categoryLabel: { ar: "نمط الحياة", en: "Lifestyle" },
    date: "2026-06-05",
    readTime: 3,
    author: {
      name: { ar: "منى يوسف", en: "Mona Youssef" },
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    },
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
    featured: false,
    content: {
      ar: `العمل عن بعد يوفر الكثير من الوقت والمجهود المخصص للتنقل، ولكنه يحمل في طياته تحديات صحية كبيرة. قضاء ساعات طويلة أمام شاشة الحاسوب دون حركة كافية قد يؤدي لمشاكل الظهر والخمول.

الحل يكمن في خلق روتين يومي منظم يفصل بين فترات العمل وفترات الراحة والتمارين الرياضية البسيطة.

بعض الخطوات المقترحة:
1. ضبط منبه كل ساعة للوقوف والتمدد لمدة 5 دقائق.
2. تجهيز مكتب مريح وصحي يدعم وضعية الظهر السليمة (Ergonomic Office).
3. الحفاظ على الوجبات المنزلية المتوازنة وشرب المياه بانتظام وتجنب الوجبات السريعة.`,
      en: `Remote work saves commuting time but introduces significant health challenges. Sitting in front of a monitor for hours without physical activity leads to back pain and fatigue.

The solution lies in creating a balanced daily routine that separates focused work from rest cycles and light workouts.

Recommended steps:
1. Set an alarm every hour to stand up and stretch for 5 minutes.
2. Designate an ergonomic workspace that supports proper posture.
3. Drink water regularly and prep home-cooked meals instead of ordering fast food.`
    }
  }
];

// TODO (Refactor): Move to store mock datasource (datasources/mocks/mock_products.ts)
export const mockProducts: Product[] = [
  {
    id: 101,
    name: {
      ar: "سماعات الرأس اللاسلكية برو زون",
      en: "ProZone Wireless Headphones ANC"
    },
    price: 199.99,
    rating: 4.8,
    reviewsCount: 128,
    category: "electronics",
    categoryLabel: { ar: "الإلكترونيات", en: "Electronics" },
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    description: {
      ar: "سماعات رأس لاسلكية فائقة الجودة مزودة بخاصية إلغاء الضجيج النشط وبطارية تدوم حتى 40 ساعة متواصلة مع وسادات مريحة للأذن.",
      en: "Premium wireless over-ear headphones featuring Active Noise Cancelling, up to 40 hours of battery life, and plush memory foam earcups."
    },
    colors: ["#171717", "#ededed", "#7850dc"],
    sizes: ["Standard"],
    specs: {
      ar: [
        { name: "نوع التوصيل", value: "بلوتوث 5.2 / سلكي" },
        { name: "عمر البطارية", value: "حتى 40 ساعة" },
        { name: "إلغاء الضجيج", value: "نشط هجين (ANC)" },
        { name: "الوزن", value: "250 جرام" }
      ],
      en: [
        { name: "Connectivity", value: "Bluetooth 5.2 / Wired" },
        { name: "Battery Life", value: "Up to 40 Hours" },
        { name: "Noise Cancelling", value: "Hybrid Active (ANC)" },
        { name: "Weight", value: "250g" }
      ]
    }
  },
  {
    id: 102,
    name: {
      ar: "ساعة اليد الذكية أكتيف فت",
      en: "ActiveFit Smart Watch Series X"
    },
    price: 249.00,
    rating: 4.6,
    reviewsCount: 94,
    category: "electronics",
    categoryLabel: { ar: "الإلكترونيات", en: "Electronics" },
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    description: {
      ar: "ساعة ذكية مقاومة للماء مع شاشة AMOLED لمراقبة ضربات القلب وتتبع جودة النوم والتمارين الرياضية مع دعم كامل للغة العربية ونظام تحديد المواقع GPS.",
      en: "Waterproof smartwatch with AMOLED display, optical heart rate monitor, sleep tracking, dual-band GPS, and multi-sport logs."
    },
    colors: ["#171717", "#ff4e88", "#20c997"],
    sizes: ["40mm", "44mm"],
    specs: {
      ar: [
        { name: "الشاشة", value: "AMOLED بمقاس 1.4 بوصة" },
        { name: "مقاومة الماء", value: "حتى عمق 50 متر (5ATM)" },
        { name: "المستشعرات", value: "نبض القلب، الأكسجين، GPS" },
        { name: "عمر الشحن", value: "حتى 7 أيام" }
      ],
      en: [
        { name: "Display", value: "1.4-inch AMOLED Screen" },
        { name: "Waterproof", value: "5ATM (Up to 50m)" },
        { name: "Sensors", value: "Heart Rate, SpO2, GPS" },
        { name: "Battery Life", value: "Up to 7 Days" }
      ]
    }
  },
  {
    id: 103,
    name: {
      ar: "حقيبة الظهر الحضرية المقاومة للماء",
      en: "Urban Waterproof Backpack"
    },
    price: 79.50,
    rating: 4.7,
    reviewsCount: 154,
    category: "accessories",
    categoryLabel: { ar: "الإكسسوارات", en: "Accessories" },
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
    description: {
      ar: "حقيبة ظهر مريحة مصممة للتنقل اليومي والسفر تحتوي على جيب مبطن للحاسوب المحمول بمقاس 15.6 بوصة ومنافذ شحن USB ذكية.",
      en: "Sleek commuter backpack crafted from weather-resistant materials, featuring a padded 15.6-inch laptop slot and USB charging pass-through."
    },
    colors: ["#3a3a3a", "#505078", "#1c3c2c"],
    sizes: ["20L", "30L"],
    specs: {
      ar: [
        { name: "المادة الخام", value: "بوليستر مقاوم للمياه وصديق للبيئة" },
        { name: "حجم التخزين", value: "20 / 30 لتر" },
        { name: "حجم اللابتوب", value: "حتى 15.6 بوصة" },
        { name: "الميزات", value: "منفذ شحن USB خارجي، جيب خفي لجواز السفر" }
      ],
      en: [
        { name: "Material", value: "Water-resistant Recycled Polyester" },
        { name: "Capacity", value: "20L / 30L" },
        { name: "Laptop Pocket", value: "Fits up to 15.6-inch Laptop" },
        { name: "Key Features", value: "USB port, hidden anti-theft back pocket" }
      ]
    }
  },
  {
    id: 104,
    name: {
      ar: "سترة الألياف الرياضية هود تيك",
      en: "HoodTech Athleisure Sport Hoodie"
    },
    price: 59.99,
    rating: 4.5,
    reviewsCount: 78,
    category: "apparel",
    categoryLabel: { ar: "الملابس", en: "Apparel" },
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600",
    description: {
      ar: "هودي رياضي خفيف الوزن ومقاوم للرطوبة ومناسب للجري أو الاستخدام اليومي المريح، مصنوع من خيوط قطنية عضوية معاد تدويرها.",
      en: "Breathable moisture-wicking sport hoodie ideal for running or casual lounging, woven from organic cotton blends."
    },
    colors: ["#c1c1c1", "#505078", "#ff4e88"],
    sizes: ["S", "M", "L", "XL"],
    specs: {
      ar: [
        { name: "نوع القماش", value: "70% قطن عضوي، 30% بوليستر معاد تدويره" },
        { name: "المرونة", value: "مرونة متوسطة لحرية الحركة" },
        { name: "العناية", value: "قابل للغسيل الآلي بالماء البارد" }
      ],
      en: [
        { name: "Fabric", value: "70% Organic Cotton, 30% Recycled Poly" },
        { name: "Elasticity", value: "Medium stretch for performance" },
        { name: "Care", value: "Machine wash cold with like colors" }
      ]
    }
  }
];

export const mockTestimonials: Testimonial[] = [
  {
    id: 1,
    name: { ar: "عمر الشريف", en: "Omar Al-Sharif" },
    role: { ar: "مطور تطبيقات", en: "Software Developer" },
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    feedback: {
      ar: "لقد اشتريت سماعات الرأس والخدمة كانت رائعة وتفاصيل المنتج واضحة تماماً. سماعات ممتازة وتستحق كل دولار دفعت فيها!",
      en: "I bought the headphones and the service was outstanding. Product details were extremely accurate. Excellent purchase, worth every dollar!"
    }
  },
  {
    id: 2,
    name: { ar: "فاطمة النجار", en: "Fatima Al-Najjar" },
    role: { ar: "صانعة محتوى", en: "Content Creator" },
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    feedback: {
      ar: "المدونة تحتوي على معلومات تقنية غنية جداً، والموقع سريع وسلس جداً في التنقل وتغيير اللغة والمظهر الداكن فوري ورائع.",
      en: "The blog is packed with rich tech articles. The site is incredibly fast, language switching is smooth, and dark mode triggers instantly."
    }
  }
];

export const mockFaqs: Faq[] = [
  {
    id: 1,
    question: {
      ar: "ما هي مدة التوصيل المعتادة للمنتجات؟",
      en: "What is the typical shipping duration?"
    },
    answer: {
      ar: "يستغرق الشحن المحلي عادة بين يومين إلى 4 أيام عمل، بينما قد يستغرق الشحن الدولي من 7 إلى 10 أيام عمل بناءً على الجمارك وبلد الوجهة.",
      en: "Local shipping usually takes 2-4 business days, while international shipping takes 7-10 business days depending on customs and location."
    }
  },
  {
    id: 2,
    question: {
      ar: "هل يمكنني إلغاء اشتراكي في النشرة الإخبارية لاحقاً؟",
      en: "Can I unsubscribe from the newsletter later?"
    },
    answer: {
      ar: "نعم، يمكنك إلغاء الاشتراك في أي وقت تريده بمجرد النقر على رابط 'إلغاء الاشتراك' الموجود أسفل أي رسالة بريد إلكتروني نرسلها لك.",
      en: "Yes, you can unsubscribe at any time by clicking the 'unsubscribe' link at the footer of any email we send you."
    }
  },
  {
    id: 3,
    question: {
      ar: "ما هي سياسة الإرجاع المتاحة لديكم؟",
      en: "What is your product return policy?"
    },
    answer: {
      ar: "نحن نقدم ضمان إرجاع كامل لمدة 30 يوماً لأي منتج تالف أو في حالته الأصلية غير المستخدمة. ما عليك سوى التواصل مع فريق الدعم لدينا.",
      en: "We offer a 30-day return policy for any damaged goods or items returned in their original, unused condition. Simply reach out to support."
    }
  }
];
