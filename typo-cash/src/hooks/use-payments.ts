"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyPayments } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/client";

export function useMyPayments() {
  return useQuery({ queryKey: ["my-payments"], queryFn: fetchMyPayments });
}

export function useSubmitPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      loan_id: string;
      amount_thebe: number;
      payment_method: string;
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke("process-repayment", {
        body: params,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-loans"] });
      queryClient.invalidateQueries({ queryKey: ["my-payments"] });
    },
  });
}
