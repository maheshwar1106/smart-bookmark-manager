import AuthWrapper from "@/components/AuthWrapper";
import LayoutWrapper from "@/components/LayoutWrapper";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthWrapper>
      <LayoutWrapper>
        {children}
      </LayoutWrapper>
    </AuthWrapper>
  );
}
