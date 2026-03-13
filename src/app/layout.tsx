import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Design Lab",
  description: "Design Lab",
  icons: {
    icon: "/my-notion-face-portrait.png",
    shortcut: "/my-notion-face-portrait.png",
    apple: "/my-notion-face-portrait.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
