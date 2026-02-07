import { ProtectedRoute } from "@/app/protected-route";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
