/*! 🌼 daisyUI 5.0.50 */
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const user = { id: 1, name: 'Randy' };
	return { user };
};
