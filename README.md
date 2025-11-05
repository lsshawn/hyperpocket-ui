# Hyperpocket UI

A SvelteKit-based web application for a multi-currency wallet system with an embeddable payment gateway for multi-product platforms (ride-hailing, car rental, delivery, etc.).

## Features

- 💳 **Multi-currency wallet management** - Support for USD, NGN, THB, EUR, GBP
- 🔐 **Secure authentication** - OTP-based login system
- 💰 **Transaction history** - View all wallet transactions with filtering
- 🚀 **Embeddable payment gateway** - Integrate payments into any application
- 📱 **Multiple payment methods** - Wallet balance, credit/debit cards, bank transfers (coming soon)
- 🎨 **Modern UI** - TailwindCSS v4 with DaisyUI components

## Tech Stack

- **Framework**: SvelteKit
- **Styling**: TailwindCSS v4 + DaisyUI
- **Database**: PostgreSQL with Drizzle ORM
- **Payment Processing**: Braintree integration
- **Language**: TypeScript
- **Package Manager**: pnpm

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm (`npm install -g pnpm`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lsshawn/hyperpocket-ui.git
   cd hyperpocket-ui
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   ```bash
   DATABASE_URL="postgres://user:password@host:port/db-name"
   PUBLIC_WALLET_API_URL="http://localhost:3000"
   ```

4. **Push database schema**
   ```bash
   pnpm db:push
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

   Visit [http://localhost:5173](http://localhost:5173)

## Development Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm dev --open       # Start dev server and open browser

# Building
pnpm build            # Create production build
pnpm preview          # Preview production build

# Code Quality
pnpm check            # Run Svelte type checking
pnpm check:watch      # Type checking in watch mode
pnpm lint             # Run Prettier and ESLint checks
pnpm format           # Format all files with Prettier

# Database
pnpm db:push          # Push schema changes (development)
pnpm db:generate      # Generate migration files
pnpm db:migrate       # Run pending migrations
pnpm db:studio        # Open Drizzle Studio GUI
```

## Payment Gateway Integration

The Hyperpocket UI includes a **reusable payment gateway** that can be embedded in other applications.

### Quick Integration

#### Option 1: Webview/iframe (for any app)

```
https://your-domain.com/payment-gateway?amount=20.00&currency=USD&productType=ride_hailing&sourceEntityType=booking&sourceEntityId=booking-123&returnUrl=https://your-app.com
```

#### Option 2: Svelte Component (for Svelte apps)

```svelte
<script>
  import PaymentGateway from '$lib/components/payment/PaymentGateway.svelte';
  import { config } from '$lib/config';

  const paymentIntent = {
    amount: 25.50,
    currency: 'USD',
    userId: 'user-123',
    productType: 'ride_hailing',
    sourceEntityType: 'booking',
    sourceEntityId: 'booking-456',
    description: 'Ride to JFK Airport'
  };

  function handleSuccess(transactionId) {
    console.log('Payment successful:', transactionId);
  }

  function handleError(error) {
    console.error('Payment failed:', error);
  }
</script>

<PaymentGateway
  {paymentIntent}
  apiBaseUrl={config.walletApiUrl}
  onSuccess={handleSuccess}
  onError={handleError}
/>
```

### Supported Payment Methods

- ✅ **Wallet** - Pay from Hyperpocket wallet balance with PIN verification
- ✅ **Credit/Debit Cards** - Visa, Mastercard, Amex via Braintree
- 🚧 **Bank Transfer** - Coming soon

### Complete Integration Guide

See [PAYMENT_GATEWAY.md](./PAYMENT_GATEWAY.md) for detailed integration instructions including:
- iOS (Swift) webview examples
- Android (Kotlin) webview examples
- React Native integration
- Security considerations
- API reference

## Project Structure

```
src/
├── lib/
│   ├── api/
│   │   └── wallet-client.ts         # Wallet backend API client
│   ├── components/
│   │   ├── payment/                 # Payment gateway components
│   │   │   ├── PaymentGateway.svelte
│   │   │   ├── WalletPayment.svelte
│   │   │   ├── CreditCardPayment.svelte
│   │   │   └── BankTransferPayment.svelte
│   │   ├── AppHeader.svelte
│   │   └── LoginForm.svelte
│   ├── server/
│   │   └── db/
│   │       ├── schema.ts            # Database schema
│   │       └── index.ts             # DB connection
│   ├── types/
│   │   └── wallet.ts                # TypeScript types
│   └── config.ts                    # App configuration
├── routes/
│   ├── (app)/                       # Authenticated routes
│   │   ├── +layout.server.ts
│   │   ├── +page.svelte             # Dashboard
│   │   ├── payment-gateway/         # Payment gateway pages
│   │   ├── transactions/            # Transaction history
│   │   └── top-up/                  # Top-up page
│   ├── (public)/                    # Public routes
│   │   └── login/
│   └── api/                         # API endpoints
│       └── auth/
└── app.css                          # Global styles & themes
```

## Database Architecture

The application implements a **double-entry accounting system**:

- **users** - User accounts with OTP authentication
- **wallets** - One wallet per user (1:1 relationship)
- **wallet_accounts** - Multi-currency accounts per wallet
  - `balance` - Ledger balance (all funds including pending)
  - `availableBalance` - Settled funds available for spending
- **transactions** - All wallet movements with double-entry semantics
- **transfer** - Idempotency records for money transfers

Key constraints:
- `availableBalance <= balance` (enforced at DB level)
- `grossAmount = netAmount + fee`
- Unique wallet-currency combinations

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `PUBLIC_WALLET_API_URL` | Wallet backend API URL | Yes |

## Testing

### Test Credentials

**Wallet Payment:**
- PIN: `123456` (mock PIN for testing)

**Credit Card (Braintree Sandbox):**
```
Card Number: 4111 1111 1111 1111
Expiry: 12/25
CVV: 123
Name: Any Name
```

## Deployment

The application uses `adapter-auto` which supports most deployment platforms:

- **Vercel** - Zero-config deployment
- **Netlify** - Automatic detection
- **Node.js** - Build and run with `node build`

For specific platforms, you may need to install a different [adapter](https://svelte.dev/docs/kit/adapters).

## Documentation

- [PAYMENT_GATEWAY.md](./PAYMENT_GATEWAY.md) - Payment gateway integration guide
- [CLAUDE.md](./CLAUDE.md) - AI assistant development guide
- [Drizzle ORM Docs](https://orm.drizzle.team/) - Database ORM
- [SvelteKit Docs](https://svelte.dev/docs/kit) - Framework documentation

## Contributing

This project uses:
- **Prettier** + **ESLint** for code formatting
- **TypeScript** in strict mode
- **pnpm** for package management

Run `pnpm format` before committing changes.

## License

MIT

## Support

For issues or questions about integrating the payment gateway, see [PAYMENT_GATEWAY.md](./PAYMENT_GATEWAY.md) or open an issue.
