# Typo Cash Solutions

**Quick Cash, Real Solutions** — NBFIRA-licensed micro-lending PWA for Botswana.

Sky-blue, mobile-first platform offering loans from P500 to P7,000 at 12-18% simple interest.

## Tech Stack

- **Next.js 14** (App Router) with TypeScript strict mode
- **Tailwind CSS** + **shadcn/ui** components
- **Supabase**: Auth (phone OTP), PostgreSQL (with RLS), Edge Functions, Storage
- **PWA**: Installable, offline fallback, service worker
- **Zod** validation, **React Hook Form**, **TanStack Query**
- **Lucide React** icons
- **Plus Jakarta Sans** (headings/body) + **JetBrains Mono** (financial figures)

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase CLI (`npm install -g supabase`)

### Setup

```bash
# Clone and install
cd typo-cash
npm install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Start Supabase locally
supabase start

# Run database migration
supabase db reset

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

### Test Accounts

After running migrations, these test accounts are seeded:

| Role | Phone | Name |
|------|-------|------|
| Admin | +26771000001 | System Admin |
| Borrower | +26772000001 | Thabo Modise (Silver) |
| Borrower | +26772000002 | Kefilwe Motswana (Bronze) |
| Borrower | +26772000003 | Mpho Kgosi (New) |
| Borrower | +26772000004 | Naledi Tau (Gold) |
| Borrower | +26772000005 | Kagiso Ratsie (New) |

### Loan Products

| Product | Range | Rate | Term |
|---------|-------|------|------|
| Quick Cash | P500–P3,000 | 12% | 14-30 days |
| Emergency | P500–P5,000 | 15% | 30 days |
| Instalment | P1,000–P7,000 | 18% | 60-90 days |
| Salary-Backed | P2,000–P7,000 | 15% | 90 days |

## Project Structure

```
src/
├── app/
│   ├── (marketing)/     # Landing, calculator, about, contact
│   ├── (borrower)/      # Dashboard, apply, loans, KYC, profile
│   ├── (admin)/         # Admin portal with sidebar
│   └── auth/            # Login, register, OTP verify
├── components/
│   ├── brand/           # Logo, NBFIRA badge, footer
│   ├── layout/          # Marketing header, borrower shell, admin sidebar
│   ├── landing/         # Hero, how-it-works, products, trust, FAQ, CTA
│   ├── loan/            # Calculator widget, loan cards
│   ├── common/          # Money display, badges, OTP input, file upload
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── loan-engine/     # Interest, penalty, schedule calculators
│   ├── supabase/        # Client, server, middleware
│   ├── money.ts         # BigInt money formatting
│   ├── constants.ts     # App constants, products, colors
│   ├── validators.ts    # Zod schemas
│   └── utils.ts         # Tailwind merge utility
├── types/               # TypeScript type definitions
└── hooks/               # React hooks

supabase/
├── migrations/          # Database schema, RLS, functions, triggers, seed
└── functions/           # Edge functions (loan engine, disbursement, etc.)

tests/                   # Vitest tests for loan engine
```

## Running Tests

```bash
npm run test
```

Tests verify:
- Simple interest calculation accuracy
- Three penalty caps (5%/month, cumulative, in duplum)
- Repayment schedule generation with remainder in last instalment

## Critical Business Rules

1. **Simple interest ONLY** — `principal × rate × days / 365`. No compound interest.
2. **Penalty caps** — 5%/month max, aggregate ≤ principal, in duplum. No override.
3. **48-hour cooling-off** — mandatory, blocks disbursement, borrower can cancel.
4. **Affordability check** — instalment ≤ 30% disposable income, DTI ≤ 60%.
5. **BigInt for all money** — stored as thebe (100 thebe = 1 Pula). Never floating point.
6. **Audit everything** — every mutation logged to audit_logs (insert-only).
7. **Soft deletes** — financial records never hard-deleted.

## License

Proprietary — Typo Cash Solutions (Pty) Ltd. Licensed by NBFIRA.
