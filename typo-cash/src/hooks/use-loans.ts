"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMyLoans, fetchLoanById, fetchAllLoans } from "@/lib/supabase/queries";

export function useMyLoans() {
  return useQuery({ queryKey: ["my-loans"], queryFn: fetchMyLoans });
}

export function useLoan(id: string) {
  return useQuery({
    queryKey: ["loan", id],
    queryFn: () => fetchLoanById(id),
    enabled: !!id,
  });
}

export function useAllLoans() {
  return useQuery({ queryKey: ["admin-loans"], queryFn: fetchAllLoans });
}
