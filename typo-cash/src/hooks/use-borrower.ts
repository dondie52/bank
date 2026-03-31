"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "./use-session";

interface BorrowerProfile {
  id: string;
  user_id: string;
  omang_number: string;
  first_name: string;
  last_name: string;
  dob: string;
  gender: string;
  marital_status: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  employer_name: string | null;
  employer_phone: string | null;
  employment_start_date: string | null;
  net_monthly_salary: number;
  borrower_tier: string;
  created_at: string;
}

export function useBorrower() {
  const { user, loading: sessionLoading } = useSession();
  const [borrower, setBorrower] = useState<BorrowerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      setBorrower(null);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    supabase
      .from("borrowers")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setBorrower(data);
        setLoading(false);
      });
  }, [user, sessionLoading]);

  return { borrower, user, loading: sessionLoading || loading };
}
