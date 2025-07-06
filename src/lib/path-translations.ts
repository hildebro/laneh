import * as m from '$lib/paraglide/messages.js';

export const transPath = (path: string): string => {
  switch (path) {
    case 'category':
      return m.settings_categories_headline();
    case 'code':
      return m.auth_access_code();
    case 'dueUserId':
      return m.schedule_next_assignee();
    case 'interval':
      return m.schedule_interval();
    case 'itemIds':
      return m.settings_items_headline();
    case 'name':
    case 'username':
      return m.generic_name();
    case 'switchUser':
      return m.settings_users_switch();
    case 'weekday':
      return m.schedule_weekday();
    default:
      return path;
  }
};