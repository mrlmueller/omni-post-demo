// components/FeatureRequestLoadingSkeleton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { FaAngleUp } from "react-icons/fa6";

export default function FeatureRequestLoadingSkeleton() {
  return (
    <div className="border rounded-xl border-slate-200">
      <div className="flex">
        <div className="px-3 py-7 border-r border-slate-200 flex flex-col items-center justify-center">
          <Button variant="ghost" size="icon" className="rounded-md h-8 w-8">
            <FaAngleUp size={25} />
          </Button>
          <Skeleton className="w-5 h-8 my-2" />
          <Button variant="ghost" size="icon" className="rounded-md h-8 w-8 rotate-180">
            <FaAngleUp size={25} />
          </Button>
        </div>
        <div className="p-7 w-full">
          <Skeleton className="w-48 h-9" />
          <Skeleton className="w-full h-4 mt-1" />
          <Skeleton className="w-full h-4 mt-1" />
          <Skeleton className="w-2/3 h-4 mt-1" />
        </div>
      </div>
    </div>
  );
}
