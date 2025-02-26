import type { PageServerLoad } from './$types';
import { type Actions, fail, redirect } from '@sveltejs/kit';
import * as table from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { USER_COOKIE } from '$lib';

export const load: PageServerLoad = async (event) => {
	return {
		users: db
			.select()
			.from(table.user)
	};
};

export const actions: Actions = {
	select: async (event) => {
		const formData = await event.request.formData();
		const id = formData.get('userId')?.toString();
		if (!id) {
			return;
		}

		const results = await db.select().from(table.user).where(eq(table.user.id, id));
		const user = results.at(0);
		if (!user) {
			return fail(400, { message: 'User does not exist.' });
		}

		event.cookies.set(USER_COOKIE, user.id, {
			path: '/'
		});

		return redirect(302, '/');
	}
};