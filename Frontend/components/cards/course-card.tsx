import React from "react";
import { Card } from "@/components/ui/card";
import { Star, Clock, Video, Heart } from "lucide-react";

interface CourseCardProps {
  title: string;
  rating: number;
  reviews: number;
  price: string;
  originalPrice?: string;
  isBestseller?: boolean;
  lessons?: number;
  duration?: string;
  imageColor?: string;
}

export function CourseCard({
  title,
  rating,
  reviews,
  price,
  originalPrice,
  isBestseller,
  lessons = 12,
  duration = "3.5 hr",
  imageColor = "bg-blue-100",
}: CourseCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden group cursor-pointer border border-gray-100">
      <div className={`relative h-48 w-full ${imageColor} transition-transform duration-300 group-hover:scale-105`}>
        {isBestseller && (
          <div className="absolute top-4 left-4 rounded-md bg-green-500 px-2.5 py-1 text-xs font-semibold text-white">
            Bestseller
          </div>
        )}
        <button className="absolute top-4 right-4 rounded-full bg-white/80 p-2 text-gray-600 backdrop-blur-sm transition-colors hover:text-red-500">
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 leading-tight">
          {title}
        </h3>

        <div className="mb-4 flex items-center gap-1.5 text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{rating}</span>
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-current" : "fill-gray-200 text-gray-200"}`}
              />
            ))}
          </div>
          <span className="text-gray-500">({reviews} reviews)</span>
        </div>

        <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Video className="h-4 w-4" />
            <span>{lessons} Lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-gray-100 pt-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">{price}</span>
              {originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {originalPrice}
                </span>
              )}
            </div>
          </div>
          <button className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white">
            Get Course
          </button>
        </div>
      </div>
    </Card>
  );
}
