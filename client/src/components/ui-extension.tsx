import React from 'react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function PageHeader({ title, description, actions }: { title: string, description?: string, actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-enter">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-2 text-lg">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
    accepted: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    rejected: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    free: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    premium: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  };

  const defaultStyle = "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize", styles[status.toLowerCase()] || defaultStyle)}>
      {status}
    </span>
  );
}
