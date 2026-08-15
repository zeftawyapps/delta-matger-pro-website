import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { ReactNode } from "react";
import clientConfig from "@/config/clientConfig.json";

export const metadata = {
  title: clientConfig.appTitle || "MatgerPro - Multi-template Hub",
  description: (clientConfig as any)?.appDescription || (clientConfig as any)?.seo?.appDescription || "Next.js templates for premium Blogs and e-commerce Stores with interactive translations and native dark mode.",
  keywords: (clientConfig as any)?.keywords || (clientConfig as any)?.seo?.keywords || "متجر, تسوق, إلكتروني",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const themeColor = (clientConfig as any)?.themeColor || (clientConfig as any)?.seo?.themeColor || "#D4AF37";

  return (
    <AppContextProvider>
      <html lang="ar" dir="rtl" data-theme="light" data-scroll-behavior="smooth" suppressHydrationWarning>
        <head>
          <meta name="color-scheme" content="light dark" />
          <meta name="theme-color" content={themeColor} />
          <style id="dynamic-theme-vars" />
          {/* Prevent Flash of Unstyled Content (FOUC) & LTR/RTL layout shift */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    var savedTheme = localStorage.getItem('theme');
                    var savedLang = localStorage.getItem('lang') || 'ar';
                    
                    // Apply theme immediately
                    if (savedTheme) {
                      document.documentElement.setAttribute('data-theme', savedTheme);
                      var meta = document.querySelector('meta[name="color-scheme"]');
                      if (meta) meta.content = savedTheme;
                    } else {
                      var isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
                    }

                    // Apply lang & dir immediately
                    document.documentElement.setAttribute('lang', savedLang);
                    document.documentElement.setAttribute('dir', savedLang === 'ar' ? 'rtl' : 'ltr');
                  } catch (e) {}
                })();
              `,
            }}
          />
        </head>
        <body suppressHydrationWarning>
          {children}
        </body>
      </html>
    </AppContextProvider>
  );
}
