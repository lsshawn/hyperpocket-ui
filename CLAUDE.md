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

## Payment Gateway System

This application includes a reusable payment gateway that can be embedded in other applications (ride-hailing, car rental, delivery, etc.).

### Payment Gateway Architecture

**Location**: `src/lib/components/payment/`

The payment gateway is built as modular Svelte components:

- `PaymentGateway.svelte` - Main entry point with payment method selector
- `WalletPayment.svelte` - Wallet balance check and PIN verification
- `CreditCardPayment.svelte` - Braintree Drop-in UI integration
- `BankTransferPayment.svelte` - Placeholder for future bank transfer support

### API Integration

**Wallet API Client**: `src/lib/api/wallet-client.ts`

Provides methods to interact with the wallet backend:
- `getWalletBalance()` - Fetch wallet balance
- `payWithWallet()` - Deduct from wallet with PIN verification
- `getBraintreeClientToken()` - Get Braintree client token for card payments
- `capturePayment()` - Charge credit card immediately
- `authorizePayment()` - Pre-authorize (hold) funds on card

**Type Definitions**: `src/lib/types/wallet.ts`

### Embedding the Payment Gateway

The gateway supports multiple integration methods:

1. **URL Parameters** (for webview/iframe):
   ```
   /payment-gateway?amount=20.00&currency=USD&productType=ride_hailing&sourceEntityType=booking&sourceEntityId=booking-123&returnUrl=https://your-app.com
   ```

2. **Component Import** (for Svelte apps):
   ```svelte
   <PaymentGateway
     paymentIntent={paymentIntentObject}
     apiBaseUrl={config.walletApiUrl}
     onSuccess={handleSuccess}
     onError={handleError}
   />
   ```

See `PAYMENT_GATEWAY.md` for detailed integration guide including iOS, Android, and React Native examples.

### Payment Flow

1. User redirected to `/payment-gateway` with payment parameters
2. Gateway fetches wallet balance from backend
3. User selects payment method (Wallet or Credit Card)
4. User completes payment (PIN for wallet, card details for credit card)
5. Gateway calls wallet backend API to process payment
6. User redirected to `/payment-gateway/completed` with transaction ID
7. Success page auto-redirects back to originating app

### Environment Variables

Required in `.env`:
- `PUBLIC_WALLET_API_URL` - Wallet backend API URL (exposed to client)

Access via: `import { config } from '$lib/config'`

## Configuration Files
- `drizzle.config.ts` - Drizzle ORM configuration (schema path, PostgreSQL dialect)
- `svelte.config.js` - SvelteKit configuration with adapter-auto
- `vite.config.ts` - Vite build configuration with TailwindCSS v4 plugin
- `tsconfig.json` - TypeScript with strict mode enabled
- `.prettierrc` - Prettier configuration with Svelte and TailwindCSS plugins
