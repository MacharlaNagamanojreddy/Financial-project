import type { ReactNode } from "react";
import { Card } from "./ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
};

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <Card className="border-dashed p-8 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center gap-4">
        {icon ? (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-700">
            {icon}
          </div>
        ) : null}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <p className="text-sm leading-7 text-muted">{description}</p>
        </div>
      </div>
    </Card>
  );
}
