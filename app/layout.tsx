import type { Metadata } from "next";
import { Cairo, Heebo, Outfit } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "خطوة Ads / Khatwa Ads",
  description:
    "Paste a business URL → honest scan → pick AR/HE/EN Meta ad lines and niche images in one sitting.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body className={`${cairo.variable} ${heebo.variable} ${outfit.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
