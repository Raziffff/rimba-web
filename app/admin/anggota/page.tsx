import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AdminAnggotaClientPage from "./client-page";

export default async function AdminAnggotaPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const members = await prisma.member.findMany({
    orderBy: [
      { category: "asc" },
      { order: "asc" },
      { name: "asc" }
    ],
  });

  return <AdminAnggotaClientPage initialMembers={members} />;
}
