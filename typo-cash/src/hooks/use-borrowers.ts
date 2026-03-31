"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAllBorrowers, fetchBorrowerById } from "@/lib/supabase/queries";

export function useAllBorrowers() {
  return useQuery({ queryKey: ["admin-borrowers"], queryFn: fetchAllBorrowers });
}

export function useBorrowerDetail(id: string) {
  return useQuery({
    queryKey: ["borrower-detail", id],
    queryFn: () => fetchBorrowerById(id),
    enabled: !!id,
  });
}
