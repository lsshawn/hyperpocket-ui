import type { PageServerLoad } from './$types';
import type { PaymentIntent } from '$lib/types/wallet';

export const load: PageServerLoad = async ({ url, parent }) => {
	const layoutData = await parent();

	// Get payment details from URL parameters (for embedded/webview use case)
	const amount = parseFloat(url.searchParams.get('amount') || '20');
	const currency = (url.searchParams.get('currency') || 'USD') as any;
	const productType = (url.searchParams.get('productType') || 'ride_hailing') as any;
	const sourceEntityType = url.searchParams.get('sourceEntityType') || 'booking';
	const sourceEntityId = url.searchParams.get('sourceEntityId') || 'demo-booking-123';
	const description = url.searchParams.get('description') || 'Payment for your booking';
	const returnUrl = url.searchParams.get('returnUrl') || '/';

	// Mock user ID - in production, this would come from auth session
	const userId = layoutData.user?.id?.toString() || 'demo-user-123';

	const paymentIntent: PaymentIntent = {
		amount,
		currency,
		userId,
		productType,
		sourceEntityType,
		sourceEntityId,
		description,
		metadata: {
			returnUrl
		}
	};

	return {
		paymentIntent
	};
};
