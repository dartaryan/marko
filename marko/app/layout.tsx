import type { Metadata } from "next";
import { Noto_Sans_Hebrew } from "next/font/google";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";

const notoSansHebrew = Noto_Sans_Hebrew({
  subsets: ["hebrew", "latin"],
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "מארקו - עורך מארקדאון עברי",
  description: "עורך מארקדאון עברי עם תמיכה מלאה ב-RTL וייצוא מעוצב",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body className={`${notoSansHebrew.variable} font-sans antialiased`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
