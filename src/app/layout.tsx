import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "US Green Deals | Exclusive Wellness Savings",
  description: "Get exclusive deals on premium wellness products delivered to your inbox. Join thousands saving on natural lifestyle products.",
  keywords: "wellness deals, natural products, lifestyle savings, green deals, organic discounts",
  openGraph: {
    title: "US Green Deals | Exclusive Wellness Savings",
    description: "Get exclusive deals on premium wellness products delivered to your inbox.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QJKX45WXV7"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QJKX45WXV7');
          `}
        </Script>
      </head>
      <body className="antialiased">
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}
