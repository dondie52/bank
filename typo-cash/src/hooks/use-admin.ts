"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchAdminKPIs,
  fetchCollectionsCases,
  fetchComplianceFlags,
  fetchAuditLogs,
  fetchKycQueue,
  fetchAdminUsers,
  fetchLoanProducts,
  fetchDisbursements,
} from "@/lib/supabase/queries";

export function useAdminKPIs() {
  return useQuery({ queryKey: ["admin-kpis"], queryFn: fetchAdminKPIs });
}

export function useCollectionsCases() {
  return useQuery({ queryKey: ["collections-cases"], queryFn: fetchCollectionsCases });
}

export function useComplianceFlags() {
  return useQuery({ queryKey: ["compliance-flags"], queryFn: fetchComplianceFlags });
}

export function useAuditLogs(page = 0) {
  return useQuery({
    queryKey: ["audit-logs", page],
    queryFn: () => fetchAuditLogs(page),
  });
}

export function useKycQueue() {
  return useQuery({ queryKey: ["kyc-queue"], queryFn: fetchKycQueue });
}

export function useAdminUsers() {
  return useQuery({ queryKey: ["admin-users"], queryFn: fetchAdminUsers });
}

export function useLoanProducts() {
  return useQuery({ queryKey: ["loan-products"], queryFn: fetchLoanProducts });
}

export function useDisbursements() {
  return useQuery({ queryKey: ["disbursements"], queryFn: fetchDisbursements });
}
