import * as m from '$lib/paraglide/messages.js';
import { BalanceEntryType } from '$lib/utils/balanceHelper';

// Kept apart from the enum, since the schema imports the enum and drizzle-kit can't resolve the messages.
export const translateBalanceEntryType = (type: BalanceEntryType): string => {
  switch (type) {
    case BalanceEntryType.Groceries:
      return m.balance_type_groceries();
    case BalanceEntryType.EatingOut:
      return m.balance_type_eating_out();
    case BalanceEntryType.Events:
      return m.balance_type_events();
    case BalanceEntryType.Gifts:
      return m.balance_type_gifts();
    case BalanceEntryType.HouseholdGoods:
      return m.balance_type_household_goods();
    case BalanceEntryType.Transportation:
      return m.balance_type_transportation();
    case BalanceEntryType.Miscellaneous:
      return m.balance_type_miscellaneous();
  }
};
