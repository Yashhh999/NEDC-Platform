"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: string;
  iconBgColor?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  iconColor = "text-primary",
  iconBgColor = "bg-blue-50",
}: FeatureCardProps) {
  return (
    <Card className="flex flex-col p-8 transition-transform hover:-translate-y-1">
      <div
        className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${iconBgColor}`}
      >
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <h3 className="mb-3 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </Card>
  );
}