import "./globals.css";
import Navbar from "../components/public/navbar";
import Footer from "../components/public/footer";

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
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}