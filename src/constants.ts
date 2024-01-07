import { type Item, type PayoutTicket } from "./interfaces.ts";

export const CURRENCY_UNITS = "GJP"; // Good Job Points

export const APP_NAME = "Rewardy";

export const PAYOUT_TICKETS: PayoutTicket[] = [
  {
    name: "Small payout",
    mean: 5,
    stdDev: 1,
    odds: 0.95,
  },
  {
    name: "Medium payout",
    mean: 10,
    stdDev: 2,
    odds: 0.35,
  },
  {
    name: "Large payout",
    mean: 20,
    stdDev: 3,
    odds: 0.15,
  },
  {
    name: "Jackpot!",
    mean: 50,
    stdDev: 4,
    odds: 0.05,
  },
];

export const ITEMS: Item[] = [
  {
    id: "Get bubble tea",
    price: 30,
    daysBetweenAvailable: 21,
  },
  {
    id: "Get a bagel",
    price: 30,
    daysBetweenAvailable: 21,
  },
  {
    id: "Get a piece of cake",
    price: 50,
    daysBetweenAvailable: 30,
  },
  {
    id: "Get to sleep in",
    price: 100,
    daysBetweenAvailable: 7,
  },
  {
    id: "Pick a restaurant",
    price: 125,
    daysBetweenAvailable: 14,
  },
  {
    id: "Get a massage (60 minutes)",
    price: 300,
    daysBetweenAvailable: 30,
  },
];
