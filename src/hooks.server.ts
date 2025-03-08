import { sequence } from '@sveltejs/kit/hooks';
import { i18n } from '$lib/i18n';
import type { Handle } from '@sveltejs/kit';
import { USER_COOKIE } from '$lib';
import { findUser } from '$lib/server/db/functions';

const handleUser: Handle = async ({ event, resolve }) => {
	const userCookie = event.cookies.get(USER_COOKIE);
	if (!userCookie) {
		event.locals.user = undefined;

		return resolve(event);
	}

	event.locals.user = await findUser(userCookie);

	return resolve(event);
};

const handleParaglide: Handle = i18n.handle();
export const handle: Handle = sequence(handleUser, handleParaglide);
