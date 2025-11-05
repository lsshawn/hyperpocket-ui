# Payment Gateway Integration Guide

This document explains how to integrate the Hyperpocket Payment Gateway into your applications (ride-hailing, car rental, delivery, etc.).

## Overview

The payment gateway provides a unified payment interface that supports:
- **Wallet payments** - Pay directly from Hyperpocket wallet balance (with PIN verification)
- **Credit/Debit cards** - Braintree Drop-in UI integration
- **Bank transfers** - Coming soon

## Architecture

The payment gateway is built as a **reusable Svelte component** that can be:
1. **Embedded directly** in other Svelte/SvelteKit apps
2. **Loaded via webview/iframe** from any application
3. **Used as a standalone payment page** with URL parameters

## URL Parameters (For Webview/iframe Embedding)

To embed the payment gateway in your app, redirect or load it with these URL parameters:

```
https://your-domain.com/payment-gateway?amount=20.00&currency=USD&productType=ride_hailing&sourceEntityType=booking&sourceEntityId=booking-123&description=Payment%20for%20ride&returnUrl=https://your-app.com/booking/123
```

### Required Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `amount` | number | Payment amount | `20.00` |
| `currency` | string | ISO currency code (USD, NGN, THB) | `USD` |
| `productType` | string | Product type: `ride_hailing`, `car_rental`, `delivery` | `ride_hailing` |
| `sourceEntityType` | string | Entity type in your app (for tracking) | `booking` |
| `sourceEntityId` | string | Entity ID in your app (for idempotency) | `booking-123` |

### Optional Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `description` | string | Payment description shown to user | `Payment for ride to airport` |
| `returnUrl` | string | URL to redirect after successful payment | `https://your-app.com/booking/123` |

## Component Integration (For Svelte Apps)

If you're building with Svelte/SvelteKit, you can directly import and use the component:

### 1. Install Dependencies

```bash
# The payment gateway requires these packages
pnpm add @iconify/svelte
```

### 2. Copy Components to Your Project

Copy these files from this repo:
- `src/lib/components/payment/PaymentGateway.svelte`
- `src/lib/components/payment/WalletPayment.svelte`
- `src/lib/components/payment/CreditCardPayment.svelte`
- `src/lib/components/payment/BankTransferPayment.svelte`
- `src/lib/api/wallet-client.ts`
- `src/lib/types/wallet.ts`

### 3. Use the Component

```svelte
<script lang="ts">
  import PaymentGateway from '$lib/components/payment/PaymentGateway.svelte';
  import type { PaymentIntent } from '$lib/types/wallet';

  const paymentIntent: PaymentIntent = {
    amount: 25.50,
    currency: 'USD',
    userId: 'user-123',
    productType: 'ride_hailing',
    sourceEntityType: 'ride_booking',
    sourceEntityId: 'booking-456',
    description: 'Ride to JFK Airport',
    metadata: {
      pickupLocation: 'Grand Central',
      dropoffLocation: 'JFK Airport'
    }
  };

  function handleSuccess(transactionId: string) {
    console.log('Payment successful:', transactionId);
    // Redirect or update your booking status
  }

  function handleError(error: string) {
    console.error('Payment failed:', error);
    // Show error to user
  }
</script>

<PaymentGateway
  {paymentIntent}
  apiBaseUrl="https://wallet-api.your-domain.com"
  onSuccess={handleSuccess}
  onError={handleError}
/>
```

## Webview Integration (For Mobile Apps)

### iOS (Swift)

```swift
import WebKit

class PaymentViewController: UIViewController, WKNavigationDelegate {
    var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()

        webView = WKWebView(frame: view.bounds)
        webView.navigationDelegate = self
        view.addSubview(webView)

        let params = [
            "amount": "25.50",
            "currency": "USD",
            "productType": "ride_hailing",
            "sourceEntityType": "booking",
            "sourceEntityId": bookingId,
            "returnUrl": "yourapp://payment-success"
        ]

        let queryString = params.map { "\($0.key)=\($0.value)" }.joined(separator: "&")
        let url = URL(string: "https://wallet.your-domain.com/payment-gateway?\(queryString)")!

        webView.load(URLRequest(url: url))
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if let url = navigationAction.request.url,
           url.scheme == "yourapp",
           url.host == "payment-success" {
            // Payment completed - close webview and refresh booking
            dismiss(animated: true)
            decisionHandler(.cancel)
            return
        }
        decisionHandler(.allow)
    }
}
```

### Android (Kotlin)

```kotlin
import android.webkit.WebView
import android.webkit.WebViewClient
import android.net.Uri

class PaymentActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)
        webView.settings.javaScriptEnabled = true
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                val uri = Uri.parse(url)
                if (uri.scheme == "yourapp" && uri.host == "payment-success") {
                    // Payment completed - close activity
                    finish()
                    return true
                }
                return false
            }
        }

        val params = mapOf(
            "amount" to "25.50",
            "currency" to "USD",
            "productType" to "ride_hailing",
            "sourceEntityType" to "booking",
            "sourceEntityId" to bookingId,
            "returnUrl" to "yourapp://payment-success"
        )

        val queryString = params.entries.joinToString("&") { "${it.key}=${it.value}" }
        val url = "https://wallet.your-domain.com/payment-gateway?$queryString"

        webView.loadUrl(url)
        setContentView(webView)
    }
}
```

### React Native

```javascript
import { WebView } from 'react-native-webview';

function PaymentScreen({ route }) {
  const { bookingId, amount } = route.params;

  const paymentUrl = `https://wallet.your-domain.com/payment-gateway?` +
    `amount=${amount}&` +
    `currency=USD&` +
    `productType=ride_hailing&` +
    `sourceEntityType=booking&` +
    `sourceEntityId=${bookingId}&` +
    `returnUrl=yourapp://payment-success`;

  const handleNavigationStateChange = (navState) => {
    if (navState.url.startsWith('yourapp://payment-success')) {
      // Payment successful - navigate back
      navigation.goBack();
    }
  };

  return (
    <WebView
      source={{ uri: paymentUrl }}
      onNavigationStateChange={handleNavigationStateChange}
    />
  );
}
```

## Payment Flow

1. **User initiates payment** in your app
2. **Your app redirects** to payment gateway with parameters
3. **User selects payment method** (Wallet or Credit Card)
4. **User completes payment** with PIN (wallet) or card details
5. **Gateway processes payment** via wallet backend API
6. **User redirected back** to your app with transaction ID
7. **Your app confirms** transaction and updates booking status

## Backend Webhook (Recommended)

For production, implement a webhook endpoint in your backend to receive payment confirmations:

```typescript
// Your backend API
app.post('/webhooks/payment-completed', async (req, res) => {
  const { transactionId, sourceEntityId, status, amount } = req.body;

  // Verify webhook signature (implement in production)
  // Update your booking/order status
  await updateBookingPaymentStatus(sourceEntityId, {
    transactionId,
    status,
    amount
  });

  res.json({ received: true });
});
```

## Environment Configuration

Add to your `.env` file:

```bash
# Wallet Backend API URL
PUBLIC_WALLET_API_URL="https://wallet-api.your-domain.com"
```

## Testing

### Test Wallet Payment
- Use PIN: `123456` (mock PIN for testing)

### Test Credit Card (Braintree Sandbox)
```
Card Number: 4111 1111 1111 1111
Expiry: 12/25
CVV: 123
Name: Any Name
```

## Security Considerations

1. **HTTPS Only** - Always use HTTPS in production
2. **CORS Configuration** - Configure wallet backend to allow your domain
3. **Webhook Verification** - Verify webhook signatures
4. **PIN Security** - Wallet PINs are sent securely over HTTPS and validated server-side
5. **PCI Compliance** - Credit card data never touches your servers (handled by Braintree)

## Support

For issues or questions:
- Check wallet backend logs: `/var/log/wallet-api`
- Review transaction status: `GET /transactions/{transactionId}`
- Contact support with transaction ID for troubleshooting
