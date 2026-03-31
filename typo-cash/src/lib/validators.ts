import { z } from "zod";

export const phoneSchema = z
  .string()
  .regex(/^\+267[0-9]{8}$/, "Enter a valid Botswana phone number (+267XXXXXXXX)");

export const omangSchema = z
  .string()
  .regex(/^[0-9]{9}$/, "Omang number must be 9 digits");

export const loginSchema = z.object({
  phone: phoneSchema,
});

export const registerSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  omangNumber: omangSchema,
  phone: phoneSchema,
});

export const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const loanApplicationStep1Schema = z.object({
  requestedAmount: z.number().min(500).max(7000),
  termDays: z.number().min(14).max(90),
});

export const loanApplicationStep2Schema = z.object({
  employerName: z.string().min(2, "Employer name is required"),
  employerPhone: z.string().optional(),
  employmentStartDate: z.string().min(1, "Employment start date is required"),
  netMonthlySalary: z.number().min(1, "Monthly salary is required"),
});

export const loanApplicationStep3Schema = z.object({
  bankName: z.string().min(2, "Bank name is required"),
  branchCode: z.string().min(3, "Branch code is required"),
  accountNumber: z.string().min(5, "Account number is required"),
  accountHolderName: z.string().min(2, "Account holder name is required"),
  accountType: z.enum(["savings", "current", "cheque"]),
});

export const loanApplicationStep4Schema = z.object({
  creditCheckConsent: z.literal(true, {
    message: "You must consent to a credit check",
  }),
});

export const disputeSchema = z.object({
  category: z.enum([
    "billing_error",
    "unauthorized_debit",
    "incorrect_balance",
    "fee_dispute",
    "service_complaint",
    "other",
  ]),
  description: z.string().min(10, "Please provide more detail"),
  disputedAmount: z.number().optional(),
});

export const bankAccountSchema = z.object({
  bankName: z.string().min(2),
  branchCode: z.string().min(3),
  accountNumber: z.string().min(5),
  accountHolderName: z.string().min(2),
  accountType: z.enum(["savings", "current", "cheque"]),
  isPrimary: z.boolean().default(false),
});

export const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().min(5),
  city: z.string().min(2),
  district: z.string().min(2),
});
