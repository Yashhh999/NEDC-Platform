import React from "react";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

interface ReviewCardProps {
  name: string;
  role: string;
  review: string;
  rating?: number;
}

export function ReviewCard({ name, role, review, rating = 5 }: ReviewCardProps) {
  return (
    <Card className="flex flex-col p-8">
      <div className="mb-6 flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${i < rating ? "fill-current" : "fill-gray-200 text-gray-200"}`}
          />
        ))}
      </div>
      <p className="mb-8 flex-1 text-lg leading-relaxed text-gray-700 font-medium">
        "{review}"
      </p>
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-xl font-bold text-gray-600">
          {name.charAt(0)}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
    </Card>
  );
}
