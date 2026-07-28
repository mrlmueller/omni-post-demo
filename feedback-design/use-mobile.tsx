"use client";

import { useMediaQuery as useMediaQueryHook } from "@/app/hooks/use-mobile";
export function useMediaQuery(query: string): boolean {
  return useMediaQueryHook(query);
}
