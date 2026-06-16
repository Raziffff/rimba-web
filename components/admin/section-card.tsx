import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SectionCardProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export default function SectionCard({
  title,
  description,
  children,
}: SectionCardProps) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-slate-50/30 pb-4 px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">{title}</CardTitle>
        <CardDescription className="mt-2 text-sm leading-7 text-slate-600">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        {children}
      </CardContent>
    </Card>
  );
}