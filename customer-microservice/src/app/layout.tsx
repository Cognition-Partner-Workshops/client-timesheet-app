import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Microservice",
  description: "Customer management microservice built with Next.js 15",
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
