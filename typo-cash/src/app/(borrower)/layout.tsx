import { BorrowerShell } from "@/components/layout/borrower-shell";
import { PWAInstallPrompt } from "@/components/common/pwa-install-prompt";

export default function BorrowerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BorrowerShell>{children}</BorrowerShell>
      <PWAInstallPrompt />
    </>
  );
}
