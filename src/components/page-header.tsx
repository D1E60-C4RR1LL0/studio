
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-headline">{title}</h1>
          {description && (
            <p className="mt-1 text-sm md:text-base text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="mt-4 md:mt-0 md:ml-4">{actions}</div>}
      </div>
    </div>
  );
}
