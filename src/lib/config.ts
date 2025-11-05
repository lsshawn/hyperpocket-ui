import { PUBLIC_WALLET_API_URL } from '$env/static/public';

export const config = {
	walletApiUrl: PUBLIC_WALLET_API_URL || 'http://localhost:3000'
};
