import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user && ['/login', '/'].includes(event.route.id)) {
		return redirect(302, '/app');
	}
	return {};
};
