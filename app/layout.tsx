import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const siteDescription =
  "Compare certification standards, understand their business benefits, prepare for assessment, and verify certificates issued by Prudential ISO.";

function requestOrigin(hostHeader: string | null, protocolHeader: string | null) {
  const host = hostHeader?.split(",", 1)[0]?.trim();
  if (!host || !/^(?:localhost|[a-z0-9.-]+)(?::\d{1,5})?$/i.test(host)) return null;

  const requestedProtocol = protocolHeader?.split(",", 1)[0]?.trim();
  const protocol = requestedProtocol === "http" && import.meta.env.DEV ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const origin = requestOrigin(
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host"),
    requestHeaders.get("x-forwarded-proto"),
  );
  const socialImage = origin ? new URL("/og.png", origin).toString() : undefined;

  return {
  title: {
    default: "Prudential ISO | Certification made clear",
    template: "%s | Prudential ISO",
  },
  description: siteDescription,
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
    openGraph: {
      title: "Certification standards explained | Prudential ISO",
      description: siteDescription,
      type: "website",
      images: socialImage ? [{ url: socialImage, width: 1730, height: 909, alt: "Prudential ISO certificate dossier" }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: "Certification standards explained | Prudential ISO",
      description: siteDescription,
      images: socialImage ? [socialImage] : undefined,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "globalThis.process??={};globalThis.process.env??={};",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
