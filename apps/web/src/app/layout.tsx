import type { Metadata } from "next";
import "./globals.css";
import "./_design/tokens.css";

export const metadata: Metadata = {
  title: "Asciigen",
  description: "ASCII generator.",
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
