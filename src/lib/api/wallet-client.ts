import type {
	ApiResponse,
	BraintreeClientTokenResponse,
	ChargePaymentResponse,
	CreditCardPaymentRequest,
	Transaction,
	WalletAccount,
	WalletWithdrawRequest
} from '$lib/types/wallet';

/**
 * Wallet API Client
 * Integrates with Hyperpocket Wallet Backend Service
 */
export class WalletApiClient {
	private baseUrl: string;

	constructor(baseUrl: string = 'http://localhost:3000') {
		this.baseUrl = baseUrl;
	}

	/**
	 * Get wallet account balance for a user and currency
	 * GET /wallets?userId={userId}&currency={currency}
	 */
	async getWalletBalance(userId: string, currency: string = 'USD'): Promise<WalletAccount> {
		const url = new URL(`${this.baseUrl}/wallets`);
		url.searchParams.append('userId', userId);
		url.searchParams.append('currency', currency);

		const response = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include'
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || error.details || 'Failed to fetch wallet balance');
		}

		const result: ApiResponse<WalletAccount> = await response.json();
		if (!result.data) {
			throw new Error('No wallet data received');
		}

		return result.data;
	}

	/**
	 * Get Braintree client token for Drop-in UI
	 * GET /payments/client-token?customerId={customerId}
	 */
	async getBraintreeClientToken(customerId?: string): Promise<string> {
		const url = new URL(`${this.baseUrl}/payments/client-token`);
		if (customerId) {
			url.searchParams.append('customerId', customerId);
		}

		const response = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include'
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || error.details || 'Failed to get client token');
		}

		const result: BraintreeClientTokenResponse = await response.json();
		return result.data.clientToken;
	}

	/**
	 * Pay with wallet balance (withdraw from wallet)
	 * POST /wallets/withdraw
	 */
	async payWithWallet(params: WalletWithdrawRequest): Promise<Transaction> {
		const response = await fetch(`${this.baseUrl}/wallets/withdraw`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify(params)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || error.details || 'Wallet payment failed');
		}

		const result: ApiResponse<Transaction> = await response.json();
		if (!result.data) {
			throw new Error('No transaction data received');
		}

		return result.data;
	}

	/**
	 * Authorize a credit card payment (pre-authorization hold)
	 * POST /payments/authorize
	 */
	async authorizePayment(params: CreditCardPaymentRequest): Promise<ChargePaymentResponse> {
		const response = await fetch(`${this.baseUrl}/payments/authorize`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify(params)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || error.details || 'Payment authorization failed');
		}

		return await response.json();
	}

	/**
	 * Charge credit card payment immediately
	 * POST /payments/charge
	 */
	async chargePayment(params: CreditCardPaymentRequest): Promise<ChargePaymentResponse> {
		const response = await fetch(`${this.baseUrl}/payments/charge`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify(params)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || error.details || 'Payment charge failed');
		}

		return await response.json();
	}

	/**
	 * Get transaction by ID
	 * GET /transactions/{transactionId}
	 */
	async getTransaction(transactionId: string): Promise<Transaction> {
		const response = await fetch(`${this.baseUrl}/transactions/${transactionId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include'
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || error.details || 'Failed to fetch transaction');
		}

		const result: ApiResponse<Transaction> = await response.json();
		if (!result.data) {
			throw new Error('No transaction data received');
		}

		return result.data;
	}
}

// Export a singleton instance
export const walletApi = new WalletApiClient();
