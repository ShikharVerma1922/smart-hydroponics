import "./globals.css";

export const metadata = {
  title: "Smart Hydroponics Core — IoT Dashboard",
  description:
    "Real-time monitoring dashboard for closed-loop hydroponic systems. Track pH, EC, water level, ambient climate, and manage peristaltic dosing pumps with ML-powered crop health diagnostics.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
