import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { resolve } from '$app/paths';
import { findAllUsers } from '$lib/server/db/functions';

export const load: LayoutServerLoad = async (event) => {
  if (event.locals.user) {
    return {
      user: event.locals.user,
    };
  }

  const users = await findAllUsers();
  if (users.length === 0) {
    if (event.route.id !== '/auth/register') {
      return redirect(302, resolve('/auth/register'));
    } else {
      return {};
    }
  }

  if (event.route.id !== '/auth') {
    return redirect(302, resolve('/auth'));
  }

  return {};
};
