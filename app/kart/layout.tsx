import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bålkart - 110 Sør-Vest",
  description: "Se registrerte bålmeldinger på kart",
};

export default function KartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Returnerer children direkte uten AppLayout wrapper
  return <>{children}</>;
}
