import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jz Communications",
  description: "Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body style={{ backgroundColor: '#000', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
