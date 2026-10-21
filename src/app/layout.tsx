import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Last Resort — Fly Fishing Collaborative Lodge Donation",
  description:
    "Fly Fishing Collaborative lodge donation: 3-night stay at The Last Resort Lodge in New Meadows, Idaho. World-class DIY fishing on the Salmon River, Little Salmon, Payette Lake, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
