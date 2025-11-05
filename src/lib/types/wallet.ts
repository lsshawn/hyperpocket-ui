// Wallet API Types
export type Currency = 'USD' | 'NGN' | 'THB' | 'EUR' | 'GBP';

export type ProductType = 'ride_hailing' | 'car_rental' | 'delivery';

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'fee';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'reversed';

export type TransactionDirection = 'credit' | 'debit';

export type PaymentMethod = 'wallet' | 'credit_card' | 'bank_transfer';

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
	walletAccountId: string;
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
}

export interface BraintreeClientToken {
	clientToken: string;
}

export interface PaymentAuthorization {
	transactionId: string;
	status: string;
	amount: string;
	message: string;
}

export interface PaymentCapture {
	transactionId: string;
	status: string;
	amount: string;
	settledAt: string;
}

// Wallet Balance Request
export interface WalletBalanceRequest {
	userId: string;
	currency: Currency;
}

// Wallet Payment Request
export interface WalletPaymentRequest {
	userId: string;
	amount: number;
	currency: Currency;
	pin: string;
	productType: ProductType;
	sourceEntityType: string;
	sourceEntityId: string;
	description?: string;
	metadata?: Record<string, any>;
}

// Credit Card Payment Request
export interface CreditCardPaymentRequest {
	userId: string;
	amount: number;
	currency: Currency;
	paymentMethodNonce: string;
	productType: ProductType;
	sourceEntityType: string;
	sourceEntityId: string;
	description?: string;
	metadata?: Record<string, any>;
}
