import * as m from '$lib/paraglide/messages.js';

export const transPath = (path: string): string => {
  switch (path) {
    case 'code':
      return m.auth_access_code();
    case 'name':
      return m.generic_name();
    default:
      return path;
  }
};