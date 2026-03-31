"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMyNotifications } from "@/lib/supabase/queries";

export function useMyNotifications() {
  return useQuery({ queryKey: ["my-notifications"], queryFn: fetchMyNotifications });
}
