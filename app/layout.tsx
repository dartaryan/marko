import type { Metadata } from "next";
import { Varela_Round, JetBrains_Mono } from "next/font/google";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Toaster } from '@/components/ui/sonner';
import { SITE_URL } from "@/lib/constants";
import "./globals.css";

const varelaRound = Varela_Round({
  weight: "400",
  subsets: ["hebrew", "latin"],
  display: "swap",
  variable: "--font-body",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

const FOUC_SCRIPT = `try{var s=localStorage.getItem('marko-v2-ui-mode');var d=s!==null?JSON.parse(s):window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "מארקו - עורך מארקדאון בעברית | כלי מארקדאון עם תמיכה מלאה ב-RTL",
    template: "%s | מארקו",
  },
  description:
    "מארקו הוא עורך מארקדאון עברי עם תמיכה מלאה ב-RTL, ייצוא מעוצב ל-PDF ו-HTML, ערכות עיצוב, דיאגרמות וכלי AI חכמים. חינמי ובלי הרשמה.",
  openGraph: {
    title: "מארקו - עורך מארקדאון בעברית",
    description:
      "כלי מארקדאון עברי עם תמיכה מלאה ב-RTL, ייצוא מעוצב, ערכות עיצוב וכלי AI. חינמי ובלי הרשמה.",
    url: SITE_URL,
    type: "website",
    locale: "he_IL",
    siteName: "מארקו",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "מארקו — עורך מארקדאון בעברית",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "מארקו - עורך מארקדאון בעברית",
    description:
      "כלי מארקדאון עברי עם תמיכה מלאה ב-RTL, ייצוא מעוצב, ערכות עיצוב וכלי AI. חינמי ובלי הרשמה.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "מארקו — עורך מארקדאון בעברית",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: FOUC_SCRIPT }} />
      </head>
      <body className={`${varelaRound.variable} ${jetBrainsMono.variable} font-sans antialiased`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <Toaster dir="rtl" position="bottom-center" duration={3000} />
      </body>
    </html>
  );
}
