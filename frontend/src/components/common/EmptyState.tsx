interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
}

export function EmptyState({ icon = '📊', title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-12 bg-bg-secondary border-2 border-dashed border-border rounded-2xl">
      <div className="text-4xl mb-3.5">{icon}</div>
      <h3 className="text-lg font-semibold mb-1.5">{title}</h3>
      <p className="text-text-muted text-sm">{description}</p>
    </div>
  );
}
