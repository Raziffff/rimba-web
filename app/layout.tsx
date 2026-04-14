import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "RIMBA",
  description: "Website organisasi RIMBA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}