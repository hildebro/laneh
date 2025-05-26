import * as m from '$lib/paraglide/messages.js';

export const transPath = (path: string): string => {
  switch (path) {
    case 'category':
      return m.settings_categories_headline();
    case 'code':
      return m.auth_access_code();
    case 'dueUserId':
      return m.schedule_next_assignee();
    case 'itemIds':
      return m.settings_items_headline();
    case 'name':
    case 'username':
      return m.generic_name();
    case 'weekday':
      return m.schedule_weekday();
    default:
      return path;
  }
};