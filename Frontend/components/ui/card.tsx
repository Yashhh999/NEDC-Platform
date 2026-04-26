import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
