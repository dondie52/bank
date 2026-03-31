"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMyApplications, fetchAllApplications, fetchApplicationById } from "@/lib/supabase/queries";

export function useMyApplications() {
  return useQuery({ queryKey: ["my-applications"], queryFn: fetchMyApplications });
}

export function useAllApplications() {
  return useQuery({ queryKey: ["admin-applications"], queryFn: fetchAllApplications });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: ["application", id],
    queryFn: () => fetchApplicationById(id),
    enabled: !!id,
  });
}
