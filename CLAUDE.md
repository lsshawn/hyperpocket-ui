# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hyperpocket UI is a SvelteKit-based web application for a multi-currency wallet system. It uses PostgreSQL with Drizzle ORM for data persistence, TailwindCSS v4 with DaisyUI for styling, and follows SvelteKit's file-based routing conventions.

## Development Commands

**Package Manager**: This project uses `pnpm`. Always use `pnpm` instead of `npm` or `yarn`.

### Core Commands
- `pnpm dev` - Start development server (with `--open` to open browser)
- `pnpm build` - Create production build
- `pnpm preview` - Preview production build locally
- `pnpm check` - Run Svelte type checking
- `pnpm check:watch` - Run type checking in watch mode

### Code Quality
- `pnpm lint` - Run Prettier and ESLint checks
- `pnpm format` - Format all files with Prettier

### Database Commands
- `pnpm db:push` - Push schema changes directly to database (development)
- `pnpm db:generate` - Generate migration files from schema changes
- `pnpm db:migrate` - Run pending migrations
- `pnpm db:studio` - Open Drizzle Studio GUI for database inspection

**Important**: Requires `DATABASE_URL` environment variable. Copy `.env.example` to `.env` and configure PostgreSQL connection string.

## Architecture & Key Patterns

### Route Groups
The application uses SvelteKit route groups for access control:

- `src/routes/(app)/` - Authenticated routes (wallet dashboard, transactions, top-up, payment gateway)
  - Layout loads user data via `+layout.server.ts`
  - All pages inherit AppHeader and authenticated layout
- `src/routes/(public)/` - Public routes (login page)
  - Separate layout without authentication checks
- `src/routes/api/` - API endpoints (e.g., `/api/auth/login-with-otp`)

### Database Architecture
The schema (`src/lib/server/db/schema.ts`) implements a double-entry accounting wallet system:

**Core Tables**:
- `users` - User accounts with OTP authentication fields
- `wallets` - One wallet per user (1:1 relationship via unique userId)
- `wallet_accounts` - Multi-currency accounts per wallet (one per currency)
  - `balance` - Ledger balance (all funds including pending)
  - `availableBalance` - Settled funds available for spending
  - Constraint: `availableBalance <= balance`
- `transactions` - All wallet movements with double-entry semantics
  - `direction` - 'credit' or 'debit'
  - `type` - 'deposit', 'withdrawal', 'transfer', 'payment', 'fee'
  - `status` - 'pending', 'completed', 'failed', 'cancelled', 'reversed'
  - Amount breakdown: `grossAmount = netAmount + fee`
  - `transferId` - Links paired debit/credit transactions
  - `reversalOf` - Self-reference for transaction reversals
- `transfer` - Idempotency records for money transfers

**Database Constraints**:
- Wallet-currency uniqueness: One account per currency per wallet
- Balance checks enforced at DB level
- Amount validation: gross = net + fee, all amounts >= 0
- Indexed on wallet_account_id, created_at, reference, and transfer_id

### Server-Side Code
- Database connection: `src/lib/server/db/index.ts`
- All database operations must use server-side routes or `+page.server.ts`/`+layout.server.ts` files
- Never import `src/lib/server/*` in client-side code

### Styling
- TailwindCSS v4 with DaisyUI component library
- Theme configuration in `src/app.css`: winter (default) and dracula themes
- DaisyUI components available throughout application

## Development Workflow

### Making Database Changes
1. Modify schema in `src/lib/server/db/schema.ts`
2. For quick iteration: `pnpm db:push` (development only)
3. For production-ready changes: `pnpm db:generate` → review migration → `pnpm db:migrate`

### Adding New Routes
- Authenticated pages: Create under `src/routes/(app)/`
- Public pages: Create under `src/routes/(public)/`
- API endpoints: Create under `src/routes/api/` with `+server.ts` files

### Working with Transactions
When implementing transaction logic:
- Always maintain double-entry semantics (paired debit/credit)
- Use `transferId` to link transaction pairs
- Respect the constraint: `grossAmount = netAmount + fee`
- Update both `balance` and `availableBalance` appropriately
- Pending transactions affect `balance`, completed ones affect `availableBalance`

## Configuration Files
- `drizzle.config.ts` - Drizzle ORM configuration (schema path, PostgreSQL dialect)
- `svelte.config.js` - SvelteKit configuration with adapter-auto
- `vite.config.ts` - Vite build configuration with TailwindCSS v4 plugin
- `tsconfig.json` - TypeScript with strict mode enabled
- `.prettierrc` - Prettier configuration with Svelte and TailwindCSS plugins
