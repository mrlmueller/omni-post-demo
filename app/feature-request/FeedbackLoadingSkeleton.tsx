"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useMediaQuery } from "../hooks/use-mobile";

export default function FeedbackLoadingSkeleton() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Mobile version
  if (isMobile) {
    return (
      <Card className="mb-3 overflow-hidden">
        <div className="flex items-center p-3 border-b">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-20 ml-2" />
          <Skeleton className="h-6 w-24 ml-auto rounded-full" />
        </div>

        <CardContent className="p-3">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3 mb-3" />

          <div className="flex items-center mb-3">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-24 ml-3" />
          </div>

          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Desktop version
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center p-4 border-b">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-4 w-20 ml-2" />
        <Skeleton className="h-6 w-24 ml-4 rounded-full" />
      </div>

      <CardContent className="pt-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-3" />

        <div className="flex items-center">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-24 ml-3" />
        </div>

        <div className="flex justify-between items-center mt-4">
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}