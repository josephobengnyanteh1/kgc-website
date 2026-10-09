import type { Metadata } from "next";
import { Cinzel, Figtree } from "next/font/google";
import "./globals.css";
const display = Cinzel({ subsets: ["latin"], variable: "--display", weight: ["500", "700"] });
const body = Figtree({ subsets: ["latin"], variable: "--body" });
export const metadata: Metadata = { title: "Kingdom Glory Church", description: "Kingdom Glory Church: Accra, Koforidua, Asamankese and Utah." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className={`${display.variable} ${body.variable}`}>{children}</body></html>;
}
