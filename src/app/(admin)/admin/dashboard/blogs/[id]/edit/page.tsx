import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LegacyEditBlogPage({ params }: PageProps) {
  await params;
  redirect("/admin/dashboard/blogs");
}
