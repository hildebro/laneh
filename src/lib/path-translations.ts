import * as m from '$lib/paraglide/messages.js';

export const transPath = (path: string): string => {
  switch (path) {
    case 'name':
      return m.generic_name();
    default:
      return path;
  }
};