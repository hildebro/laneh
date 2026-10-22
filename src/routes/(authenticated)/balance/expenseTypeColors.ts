import { BalanceEntryType } from '$lib/utils/balanceHelper';

// Each type keeps its color in every chart, no matter which types appear. The colors are the --series-n variables.
export const expenseTypeColors: Record<BalanceEntryType, number> = {
  [BalanceEntryType.Groceries]: 1,
  [BalanceEntryType.EatingOut]: 2,
  [BalanceEntryType.HouseholdGoods]: 3,
  [BalanceEntryType.Transportation]: 4,
  [BalanceEntryType.Events]: 5,
  [BalanceEntryType.Gifts]: 6,
  [BalanceEntryType.Miscellaneous]: 7
};
