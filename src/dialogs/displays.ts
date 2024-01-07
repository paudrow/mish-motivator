import { currencyUnits } from "../constants.ts";

export function formatPoints(amount: number): string {
  return `${amount.toFixed(2)} ${currencyUnits}`;
}
