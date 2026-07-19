import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://rentapp.homes"),
  title: {
    default: "RentApp — Apply for your next home",
    template: "%s · RentApp",
  },
  description:
    "Apply for your rental in about a minute. A simple, secure application with a one-time $39.99 processing fee.",
  applicationName: "RentApp",
  openGraph: {
    title: "RentApp — Apply for your next home",
    description: "A simple, secure rental application with a one-time $39.99 processing fee.",
    url: "https://rentapp.homes",
    siteName: "RentApp",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "RentApp — Apply for your next home",
    description: "A simple, secure rental application with a one-time $39.99 processing fee.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#4F46E5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
