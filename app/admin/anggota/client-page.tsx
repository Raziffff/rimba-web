"use client";

import { useState } from "react";
import PageHeader from "@/components/admin/page-header";
import SectionCard from "@/components/admin/section-card";
import MemberForm from "@/components/admin/member-form";
import MemberTable from "@/components/admin/member-table";
import type { MemberInput } from "@/lib/validations";

interface Member {
  id: string;
  name: string;
  position: string;
  category: string | null;
  imageUrl: string | null;
  order: number;
}

interface AdminAnggotaClientPageProps {
  initialMembers: Member[];
}

export default function AdminAnggotaClientPage({ initialMembers }: AdminAnggotaClientPageProps) {
  const [editingMember, setEditingMember] = useState<(MemberInput & { id: string }) | null>(null);

  const handleEdit = (member: Member) => {
    setEditingMember({
      id: member.id,
      name: member.name,
      position: member.position,
      category: member.category || "",
      imageUrl: member.imageUrl || "",
      order: member.order,
    });
    // Scroll to form or show modal
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSuccess = () => {
    setEditingMember(null);
  };

  return (
    <section className="space-y-8 pb-20">
      <PageHeader
        eyebrow="Manajemen Organisasi"
        title="Daftar Anggota"
        description="Kelola profil, jabatan, dan struktur kepengurusan organisasi RIMBA."
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <MemberForm 
              initialData={editingMember || undefined} 
              onSuccess={handleSuccess}
            />
            {editingMember && (
              <button 
                onClick={() => setEditingMember(null)}
                className="mt-4 w-full text-sm text-slate-500 hover:text-slate-800 transition-colors"
              >
                Batal Edit
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <SectionCard
            title="Database Anggota"
            description="Daftar pengurus dan anggota yang aktif saat ini."
          >
            <div className="mt-4 sm:-mx-6">
              <MemberTable 
                members={initialMembers} 
                onEdit={handleEdit}
              />
            </div>
          </SectionCard>
        </div>
      </div>
    </section>
  );
}
