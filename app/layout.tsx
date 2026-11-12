import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Tài Chính ProMax | Quản Lý Tài Chính Cá Nhân Thông Minh",
  description:
    "Hệ thống quản lý tài chính cá nhân thông minh, tinh tế, chuẩn xác theo tiêu chuẩn quốc tế và phong cách Việt Nam.",
  keywords: ["quản lý tài chính", "tiết kiệm", "thu chi", "hóa đơn", "ngân sách", "Next.js"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
