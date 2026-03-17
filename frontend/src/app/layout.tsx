import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cypher-Net",
  description: "Cypher-Net — encrypted real-time chat",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-discord-bg text-discord-text-primary antialiased">{children}</body>
    </html>
  );
}
