import { CURRENCY_UNITS } from "../constants.ts";

export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} ${CURRENCY_UNITS}`;
}
