import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SocialCardLoadingSkeleton = () => {
  return (
    <div>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-4 sm:gap-6 md:gap-5 lg:gap-7 xl:gap-5 2xl:gap-7"
      >
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="p-2 sm:p-3 md:p-4 rounded-xl flex flex-row items-center justify-between transition-all duration-500 border"
          >
            <div className="flex flex-row items-center w-full">
              <Skeleton className="h-10 w-10 rounded-full mr-4 sm:mr-5" />
              <div className="flex flex-col justify-start w-full">
                <Skeleton className="w-16 h-6 mb-2" />
                <Skeleton className="w-24 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialCardLoadingSkeleton;
