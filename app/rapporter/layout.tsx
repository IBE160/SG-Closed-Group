import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bålmelding - 110 Sør-Vest",
  description: "Meld inn bålbrenning til 110 Sør-Vest",
};

export default function RapporterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Returnerer children direkte - ingen wrapper som kan blokkere events
  return <>{children}</>;
}
