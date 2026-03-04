import type { Metadata } from "next";
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
      <body className="antialiased">
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}
