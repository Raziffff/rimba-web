type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-2 text-3xl font-bold text-slate-900">{title}</h1>
      {description && (
        <p className="mt-3 max-w-2xl text-slate-600">{description}</p>
      )}
    </div>
  );
}