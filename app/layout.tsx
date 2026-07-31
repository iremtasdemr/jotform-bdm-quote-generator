import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jotform Enterprise Quote Generator",
  description: "Create customer-ready Jotform Enterprise quote PDFs.",
  icons: {
    icon: "/jotform-mark.svg",
    shortcut: "/jotform-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
