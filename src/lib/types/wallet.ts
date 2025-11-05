// Wallet API Types
export type Currency = 'USD' | 'NGN' | 'THB' | 'EUR' | 'GBP' | 'MYR' | 'SGD';

export type ProductType = 'ride_hailing' | 'car_rental' | 'delivery';

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'fee' | 'refund';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'reversed';

export type TransactionDirection = 'credit' | 'debit';

export type PaymentMethod = 'wallet' | 'credit_card' | 'bank_transfer';

export type PaymentProcessor = 'braintree' | 'stripe' | 'adyen' | 'razorpay';

// API Response wrapper
export interface ApiResponse<T> {
	data?: T;
	message: string;
	success?: boolean;
}

// Wallet Account
export interface WalletAccount {
	id: string;
	walletId: string;
	currency: Currency;
	balance: string;
	availableBalance: string;
	createdAt: string;
	updatedAt: string;
}

// Transaction
export interface Transaction {
	id: string;
	walletAccountId?: string;
	type: TransactionType;
	direction: TransactionDirection;
	status: TransactionStatus;
	grossAmount: string;
	fee: string;
	netAmount: string;
	currency: string;
	transferId?: string;
	reversalOf?: string;
	description?: string;
	metadata?: Record<string, any>;
	reference?: string;
	platformRef?: string;
	processor?: PaymentProcessor;
	processorTransactionId?: string;
	createdAt: string;
	updatedAt: string;
	settledAt?: string;
}

// Payment Gateway Types
export interface PaymentIntent {
	amount: number;
	currency: Currency;
	userId: string;
	productType: ProductType;
	sourceEntityType: string;
	sourceEntityId: string;
	description?: string;
	metadata?: Record<string, any>;
	country?: string;
}

export interface BraintreeClientTokenResponse {
	data: {
		clientToken: string;
	};
	message: string;
}

// Payment Authorization (from backend)
export interface PaymentAuthorization {
	id: string;
	gatewayTransactionId: string;
	processor: PaymentProcessor;
	status: string;
	authorizedAmount: string;
	capturedAmount: string;
	currency: string;
	platformRef: string;
}

// Charge Payment Response (from /payments/charge)
export interface ChargePaymentResponse {
	data: {
		authorization: PaymentAuthorization;
		transaction: Transaction;
	};
	message: string;
}

// Wallet Deposit Payment Request (for /wallets/deposit/payment)
export interface WalletDepositPaymentRequest {
	userId: string;
	amount: number;
	currency: string;
	paymentMethod: 'credit_card' | 'bank_transfer';
	paymentMethodNonce: string;
	country?: string;
	idempotencyKey: string;
	processorType?: PaymentProcessor;
	productType: ProductType;
	sourceEntityType: string;
	sourceEntityId: string;
	description?: string;
}

// Wallet Withdraw Request (for /wallets/withdraw)
export interface WalletWithdrawRequest {
	userId: string;
	amount: number;
	currency: string;
}

// Credit Card Payment Request (for /payments/charge)
export interface CreditCardPaymentRequest {
	userId: string;
	amount: number;
	currency: string;
	paymentMethodNonce: string;
	productType: ProductType;
	sourceEntityType: string;
	sourceEntityId: string;
	idempotencyKey: string;
	country?: string;
	description?: string;
}
