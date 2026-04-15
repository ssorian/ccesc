import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getTeacherById } from "@/features/teachers/services/teacher.service";
import { TeacherMainLayout } from "@/components/layouts/TeacherLayout";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) return <div>No has iniciado sesion</div>;

  const userId = session.user?.id ?? "";
  const teacher = await getTeacherById({ id: userId });

  if (!teacher) return <div>No has iniciado sesion</div>;

  const userTeacher = {
    ...(teacher as any).user,
  }

  return (
    <TeacherMainLayout user={userTeacher}>
      {children}
    </TeacherMainLayout>
  );
}
