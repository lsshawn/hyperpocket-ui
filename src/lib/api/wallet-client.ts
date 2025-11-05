import type {
	AdminTransactionsRequest,
	AdminTransactionsResponse,
	ApiResponse,
	BraintreeClientTokenResponse,
	ChargePaymentResponse,
	CreditCardPaymentRequest,
	FeeSummaryResponse,
	ProcessorBreakdownResponse,
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

	/**
	 * Admin: Get all transactions with filtering and pagination
	 * GET /admin/transactions
	 */
	async getAdminTransactions(params: AdminTransactionsRequest = {}): Promise<AdminTransactionsResponse> {
		const url = new URL(`${this.baseUrl}/admin/transactions`);

		if (params.page) url.searchParams.append('page', params.page.toString());
		if (params.limit) url.searchParams.append('limit', params.limit.toString());
		if (params.userId) url.searchParams.append('userId', params.userId);
		if (params.type) url.searchParams.append('type', params.type);
		if (params.currency) url.searchParams.append('currency', params.currency);
		if (params.processor) url.searchParams.append('processor', params.processor);
		if (params.startDate) url.searchParams.append('startDate', params.startDate);
		if (params.endDate) url.searchParams.append('endDate', params.endDate);

		const response = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include'
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || error.details || 'Failed to fetch admin transactions');
		}

		return await response.json();
	}

	/**
	 * Admin: Get fee summary and breakdown
	 * GET /admin/fees/summary
	 */
	async getFeeSummary(params: {
		currency?: string;
		startDate?: string;
		endDate?: string;
		processor?: string;
	} = {}): Promise<FeeSummaryResponse> {
		const url = new URL(`${this.baseUrl}/admin/fees/summary`);

		if (params.currency) url.searchParams.append('currency', params.currency);
		if (params.startDate) url.searchParams.append('startDate', params.startDate);
		if (params.endDate) url.searchParams.append('endDate', params.endDate);
		if (params.processor) url.searchParams.append('processor', params.processor);

		const response = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include'
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || error.details || 'Failed to fetch fee summary');
		}

		return await response.json();
	}

	/**
	 * Admin: Get processor breakdown and comparison
	 * GET /admin/fees/processor-breakdown
	 */
	async getProcessorBreakdown(): Promise<ProcessorBreakdownResponse> {
		const response = await fetch(`${this.baseUrl}/admin/fees/processor-breakdown`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include'
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || error.details || 'Failed to fetch processor breakdown');
		}

		return await response.json();
	}
}

// Export a singleton instance
export const walletApi = new WalletApiClient();
