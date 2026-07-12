"use server";

import prisma from "@/lib/prisma";

type LogAdminActivityInput = {
  action: "CREATE" | "UPDATE" | "DELETE" | "IMPORT";
  entityType: string;
  entityId?: string;
  title: string;
  detail?: string;
};

export async function logAdminActivity({
  action,
  entityType,
  entityId,
  title,
  detail,
}: LogAdminActivityInput) {
  try {
    await prisma.activityLog.create({
      data: {
        action,
        entityType,
        entityId,
        title,
        detail,
      },
    });
  } catch (error) {
    console.error("Failed to write activity log:", error);
  }
}
