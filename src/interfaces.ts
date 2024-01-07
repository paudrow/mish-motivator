export interface User {
  id: string;
  balance: number;
  items: {
    id: string;
    quantity: number;
  }[];
}

export interface Item {
  id: string;
  price: number;
  daysBetweenAvailable: number;
}

export interface PurchaseEvent {
  id: string;
  userId: string;
  itemId: string;
  date: Date;
  cost: number;
}

export interface PayoutEvent {
  id: string;
  userId: string;
  date: Date;
  amount: number;
}

export interface ExhaustItemEvent {
  id: string;
  userId: string;
  itemId: string;
  date: Date;
}

export interface PayoutTicket {
  name: string;
  mean: number;
  stdDev: number;
  odds: number;
}
