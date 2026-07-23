/** True when admin category text contains "lomba" (case-insensitive). */
export function isLombaCategory(category: string | null | undefined): boolean {
  return category?.toLowerCase().includes("lomba") ?? false;
}

/** Short badge label for agenda cards on the public site. */
export function getAgendaHighlightLabel(category: string | null | undefined): string {
  return isLombaCategory(category) ? "Lomba" : "Kegiatan";
}
