"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyDisputes, fetchAllDisputes, createDispute } from "@/lib/supabase/queries";

export function useMyDisputes() {
  return useQuery({ queryKey: ["my-disputes"], queryFn: fetchMyDisputes });
}

export function useAllDisputes() {
  return useQuery({ queryKey: ["admin-disputes"], queryFn: fetchAllDisputes });
}

export function useCreateDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDispute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-disputes"] });
    },
  });
}
