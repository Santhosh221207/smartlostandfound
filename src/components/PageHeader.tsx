interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function PageHeader({ eyebrow, title, description }: Props) {
  return (
    <header className="mb-8">
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold tracking-[0.18em] uppercase text-primary">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
      {description && <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>}
    </header>
  );
}
