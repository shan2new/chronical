import "./globals.css";

export const metadata = {
  title: "Chronicle — Personal Medical History",
  description: "A personal medical history helper to track conditions, visits, medications, and lab results.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
