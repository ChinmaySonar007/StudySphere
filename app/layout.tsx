import Script from "next/script";
import ThemeProvider from "@/components/providers/ThemeProvider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />

        <ThemeProvider>
          {children}
        </ThemeProvider>

      </body>
    </html>
  );
}