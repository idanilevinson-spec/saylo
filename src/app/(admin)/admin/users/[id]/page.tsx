import Link from "next/link";
import AdminUserDetail from "@/components/admin/AdminUserDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div>
      <Link href="/admin/users" className="text-sm text-primary">
        ← כל המשתמשים
      </Link>
      <div className="mt-4">
        <AdminUserDetail profileId={id} />
      </div>
    </div>
  );
}
