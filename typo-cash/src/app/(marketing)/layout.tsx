import { MarketingHeader } from "@/components/layout/marketing-header";
import { Footer } from "@/components/brand/footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingHeader />
      <main>{children}</main>
      <Footer />
    </>
  );
}
