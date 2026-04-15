import { type Actions } from '@sveltejs/kit';
import { deleteSessionCookie } from '$lib/server/auth';

export const actions: Actions = {
  logout: async (event) => {
    deleteSessionCookie(event.cookies);
  }
};
