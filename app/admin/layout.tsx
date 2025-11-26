import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - 110 Sør-Vest",
  description: "Administrasjon av bålmeldinger",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Returnerer children direkte uten AppLayout wrapper
  return <>{children}</>;
}
