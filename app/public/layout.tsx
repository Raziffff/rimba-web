import Navbar from "@/components/public/navbar";
import Footer from "@/components/public/footer";
import ChatWidget from "@/components/public/chat-widget";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <ChatWidget />
    </>
  );
}
