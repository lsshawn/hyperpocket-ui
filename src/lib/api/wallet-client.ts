import type {
	ApiResponse,
	BraintreeClientToken,
	CreditCardPaymentRequest,
	Currency,
	PaymentAuthorization,
	PaymentCapture,
	Transaction,
	WalletAccount,
	WalletBalanceRequest,
	WalletPaymentRequest
} from '$lib/types/wallet';

export class WalletApiClient {
	private baseUrl: string;

	constructor(baseUrl: string = 'http://localhost:3000') {
		this.baseUrl = baseUrl;
	}

	/**
	 * Get wallet account balance for a user and currency
	 */
	async getWalletBalance(params: WalletBalanceRequest): Promise<ApiResponse<WalletAccount>> {
		const url = new URL(`${this.baseUrl}/wallets`);
		url.searchParams.append('userId', params.userId);
		url.searchParams.append('currency', params.currency);

		const response = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to fetch wallet balance');
		}

		return response.json();
	}

	/**
	 * Get Braintree client token for Drop-in UI
	 */
	async getBraintreeClientToken(userId: string): Promise<ApiResponse<BraintreeClientToken>> {
		const response = await fetch(`${this.baseUrl}/payments/client-token`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ userId })
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to get client token');
		}

		return response.json();
	}

	/**
	 * Pay with wallet balance (deduct from available balance)
	 */
	async payWithWallet(params: WalletPaymentRequest): Promise<ApiResponse<Transaction>> {
		const response = await fetch(`${this.baseUrl}/payments/wallet`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(params)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Wallet payment failed');
		}

		return response.json();
	}

	/**
	 * Authorize a credit card payment (pre-authorization hold)
	 */
	async authorizePayment(
		params: CreditCardPaymentRequest
	): Promise<ApiResponse<PaymentAuthorization>> {
		const response = await fetch(`${this.baseUrl}/payments/authorize`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(params)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Payment authorization failed');
		}

		return response.json();
	}

	/**
	 * Capture a credit card payment immediately
	 */
	async capturePayment(params: CreditCardPaymentRequest): Promise<ApiResponse<PaymentCapture>> {
		const response = await fetch(`${this.baseUrl}/payments/charge`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(params)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Payment capture failed');
		}

		return response.json();
	}

	/**
	 * Release a pre-authorized payment
	 */
	async releaseAuthorization(transactionId: string): Promise<ApiResponse<any>> {
		const response = await fetch(`${this.baseUrl}/payments/release`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ transactionId })
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to release authorization');
		}

		return response.json();
	}

	/**
	 * Capture a partial amount from a pre-authorized payment
	 */
	async capturePartialAuthorization(
		transactionId: string,
		claimAmount: number
	): Promise<ApiResponse<PaymentCapture>> {
		const response = await fetch(`${this.baseUrl}/payments/capturePartial`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ transactionId, claimAmount })
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to capture partial payment');
		}

		return response.json();
	}

	/**
	 * Get transaction by ID
	 */
	async getTransaction(transactionId: string): Promise<ApiResponse<Transaction>> {
		const response = await fetch(`${this.baseUrl}/transactions/${transactionId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to fetch transaction');
		}

		return response.json();
	}

	/**
	 * Get wallet transactions
	 */
	async getWalletTransactions(userId: string, currency?: Currency): Promise<ApiResponse<Transaction[]>> {
		const url = new URL(`${this.baseUrl}/wallets/transactions`);
		url.searchParams.append('userId', userId);
		if (currency) {
			url.searchParams.append('currency', currency);
		}

		const response = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to fetch transactions');
		}

		return response.json();
	}
}

// Export a singleton instance
export const walletApi = new WalletApiClient();
