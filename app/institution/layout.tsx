import { InstitutionMainLayout } from "@/components/layouts/InstitutionLayout";

const adminUser = {
  name: "Administrador",
  email: "admin@ccesc.edu",
  avatar: "/avatars/admin.jpg",
};

export default async function InstitutionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InstitutionMainLayout user={adminUser}>
      {children}
    </InstitutionMainLayout>
  );
}
