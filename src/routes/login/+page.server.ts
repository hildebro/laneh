import { encodeBase32LowerCase } from '@oslojs/encoding';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions } from './$types';

export const actions: Actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (!validateUsername(username)) {
			return fail(400, { message: 'Invalid username (min 3, max 31 characters, alphanumeric only)' });
		}
		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password (min 6, max 255 characters)' });
		}

		const results = await db
			.select()
			.from(table.user)
			.where(eq(table.user.username, username));

		const existingUser = results.at(0);
		if (!existingUser) {
			return fail(400, { message: 'Incorrect username or password' });
		}

		return redirect(302, '/');
	},
	register: async (event) => {
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
		return redirect(302, '/app');
	},
};

function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}

function validateUsername(username: unknown): username is string {
	return (
		typeof username === 'string' &&
		username.length >= 3 &&
		username.length <= 31 &&
		/^[a-z0-9_-]+$/.test(username)
	);
}

function validatePassword(password: unknown): password is string {
	return (
		typeof password === 'string' &&
		password.length >= 6 &&
		password.length <= 255
	);
}
