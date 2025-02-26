import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async (event) => {
	if (event.locals.user && ['/login', '/'].includes(event.route.id ?? '')) {
		return redirect(302, '/app');
	}
	return {};
};
