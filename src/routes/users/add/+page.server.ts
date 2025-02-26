import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions } from './$types';
import { encodeBase32LowerCase } from '@oslojs/encoding';

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');

		if (!validateUsername(username)) {
			return fail(400, { message: 'Invalid username' });
		}

		const userId = generateUserId();

		try {
			await db.insert(table.user).values({ id: userId, username  });
		} catch (e) {
			return fail(500, { message: 'An error has occurred' });
		}
		return redirect(302, '/users');
	},
};

function validateUsername(username: unknown): username is string {
	return (
		typeof username === 'string' &&
		username.length >= 3 &&
		username.length <= 31 &&
		/^[a-z0-9_-]+$/.test(username)
	);
}

function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	return encodeBase32LowerCase(bytes);
}
