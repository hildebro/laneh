import { sequence } from '@sveltejs/kit/hooks';
import { i18n } from '$lib/i18n';
import type { Handle } from '@sveltejs/kit';
import { USER_COOKIE } from '$lib';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const handleUser: Handle = async ({ event, resolve }) => {
	const userCookie = event.cookies.get(USER_COOKIE);
	if (!userCookie) {
		event.locals.user = undefined;

		return resolve(event);
	}

	const result = await db.select().from(table.user).where(eq(table.user.id, userCookie))
	const user = result.at(0);
	if (!user) {
		event.locals.user = undefined;

		return resolve(event);
	}

	event.locals.user = user;

	return resolve(event);
};

const handleParaglide: Handle = i18n.handle();
export const handle: Handle = sequence(handleUser, handleParaglide);
