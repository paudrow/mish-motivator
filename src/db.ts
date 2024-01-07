import {
  ExhaustItemEvent,
  Item,
  PayoutEvent,
  PurchaseEvent,
  User,
} from "./interfaces.ts";

const DENO_KV_PATH_KEY = "DENO_KV_PATH";
let path = undefined;
if (
  (await Deno.permissions.query({ name: "env", variable: DENO_KV_PATH_KEY }))
    .state === "granted"
) {
  path = Deno.env.get(DENO_KV_PATH_KEY);
}
export const kv = await Deno.openKv(path);

export async function reset() {
  const iter = kv.list({ prefix: [] });
  for await (const entry of iter) {
    await kv.delete(entry.key);
  }
}

const USER_KEY_PREFIX = "user";
const ITEM_KEY_PREFIX = "item";
const PURCHASE_EVENT_KEY_PREFIX = "purchaseEvent";
const PAYOUT_EVENT_KEY_PREFIX = "payoutEvent";
const EXHAUST_ITEM_EVENT_KEY_PREFIX = "exhaustItemEvent";

function getUserKey(userId: string): string[] {
  return [USER_KEY_PREFIX, userId];
}

function getItemKey(itemId: string): string[] {
  return [ITEM_KEY_PREFIX, itemId];
}

function getPurchaseEventKey(purchaseEventId: string): string[] {
  return [PURCHASE_EVENT_KEY_PREFIX, purchaseEventId];
}

function getPayoutEventKey(payoutEventId: string): string[] {
  return [PAYOUT_EVENT_KEY_PREFIX, payoutEventId];
}

function getExhaustItemEventKey(useItemEventId: string): string[] {
  return [EXHAUST_ITEM_EVENT_KEY_PREFIX, useItemEventId];
}

export async function createUser(
  id: string,
  startingBalance: number,
): Promise<string> {
  const user: User = {
    id,
    balance: startingBalance,
    items: [],
  };
  const key = getUserKey(id);
  await kv.set(key, user);
  return id;
}

export async function getUserById(id: string): Promise<User | null> {
  const key = getUserKey(id);
  const entry = await kv.get<User>(key);
  return entry.value;
}

export async function updateUser(user: User): Promise<void> {
  const key = getUserKey(user.id);
  await kv.set(key, user);
}

export async function deleteUserById(id: string): Promise<void> {
  const key = getUserKey(id);
  await kv.delete(key);

  {
    const iter = kv.list({ prefix: [PURCHASE_EVENT_KEY_PREFIX] });
    for await (const res of iter) {
      const purchaseEvent = res.value as PurchaseEvent;
      if (purchaseEvent.userId === id) {
        await kv.delete(getPurchaseEventKey(purchaseEvent.id));
      }
    }
  }
  {
    const iter = kv.list({ prefix: [PAYOUT_EVENT_KEY_PREFIX] });
    for await (const res of iter) {
      const payoutEvent = res.value as PayoutEvent;
      if (payoutEvent.userId === id) {
        await kv.delete(getPayoutEventKey(payoutEvent.id));
      }
    }
  }
  {
    const iter = kv.list({ prefix: [EXHAUST_ITEM_EVENT_KEY_PREFIX] });
    for await (const res of iter) {
      const useItemEvent = res.value as ExhaustItemEvent;
      if (useItemEvent.userId === id) {
        await kv.delete(getExhaustItemEventKey(useItemEvent.id));
      }
    }
  }
}

export async function createItem(
  id: string,
  price: number,
  daysBetweenAvailable: number,
): Promise<string> {
  const item: Item = {
    id,
    price,
    daysBetweenAvailable,
  };
  const key = getItemKey(id);
  await kv.set(key, item);
  return id;
}

export async function getItemById(id: string): Promise<Item | null> {
  const key = getItemKey(id);
  const entry = await kv.get<Item>(key);
  return entry.value;
}

export async function getItems(): Promise<Item[]> {
  const iter = kv.list({ prefix: [ITEM_KEY_PREFIX] });
  const items: Item[] = [];
  for await (const res of iter) {
    const item = res.value as Item;
    items.push(item);
  }
  return items;
}

export async function updateItem(item: Item): Promise<void> {
  const key = getItemKey(item.id);
  await kv.set(key, item);
}

export async function deleteItemById(id: string): Promise<void> {
  const key = getItemKey(id);
  await kv.delete(key);

  {
    const iter = kv.list({ prefix: [USER_KEY_PREFIX] });
    for await (const res of iter) {
      const user = res.value as User;
      const itemIndex = user.items.findIndex((item) => item.id === id);
      if (itemIndex !== -1) {
        user.items.splice(itemIndex, 1);
        await updateUser(user);
      }
    }
  }
  {
    const iter = kv.list({ prefix: [PURCHASE_EVENT_KEY_PREFIX] });
    for await (const res of iter) {
      const purchaseEvent = res.value as PurchaseEvent;
      if (purchaseEvent.itemId === id) {
        await kv.delete(getPurchaseEventKey(purchaseEvent.id));
      }
    }
  }
  {
    const iter = kv.list({ prefix: [EXHAUST_ITEM_EVENT_KEY_PREFIX] });
    for await (const res of iter) {
      const useItemEvent = res.value as ExhaustItemEvent;
      if (useItemEvent.itemId === id) {
        await kv.delete(getExhaustItemEventKey(useItemEvent.id));
      }
    }
  }
}

export async function createPurchaseEvent(
  userId: string,
  itemId: string,
  cost: number,
): Promise<string> {
  const id = crypto.randomUUID();
  const purchaseEvent: PurchaseEvent = {
    id,
    userId,
    itemId,
    date: new Date(),
    cost,
  };
  const key = getPurchaseEventKey(id);
  await kv.set(key, purchaseEvent);
  return id;
}

export async function getPurchaseEventById(
  id: string,
): Promise<PurchaseEvent | null> {
  const key = getPurchaseEventKey(id);
  const entry = await kv.get<PurchaseEvent>(key);
  return entry.value;
}

export async function updatePurchaseEvent(
  purchaseEvent: PurchaseEvent,
): Promise<void> {
  const key = getPurchaseEventKey(purchaseEvent.id);
  await kv.set(key, purchaseEvent);
}

export async function deletePurchaseEventById(id: string): Promise<void> {
  const key = getPurchaseEventKey(id);
  await kv.delete(key);
}

export async function createPayoutEvent(
  userId: string,
  amount: number,
): Promise<string> {
  const id = crypto.randomUUID();
  const payoutEvent: PayoutEvent = {
    id,
    userId,
    date: new Date(),
    amount,
  };
  const key = getPayoutEventKey(id);
  await kv.set(key, payoutEvent);
  return id;
}

export async function getPayoutEventById(
  id: string,
): Promise<PayoutEvent | null> {
  const key = getPayoutEventKey(id);
  const entry = await kv.get<PayoutEvent>(key);
  return entry.value;
}

export async function updatePayoutEvent(
  payoutEvent: PayoutEvent,
): Promise<void> {
  const key = getPayoutEventKey(payoutEvent.id);
  await kv.set(key, payoutEvent);
}

export async function deletePayoutEventById(id: string): Promise<void> {
  const key = getPayoutEventKey(id);
  await kv.delete(key);
}

export async function createExhaustItemEvent(
  userId: string,
  itemId: string,
): Promise<string> {
  const id = crypto.randomUUID();
  const useItemEvent: ExhaustItemEvent = {
    id,
    userId,
    itemId,
    date: new Date(),
  };
  const key = getExhaustItemEventKey(id);
  await kv.set(key, useItemEvent);
  return id;
}

export async function getExhaustItemEventById(
  id: string,
): Promise<ExhaustItemEvent | null> {
  const key = getExhaustItemEventKey(id);
  const entry = await kv.get<ExhaustItemEvent>(key);
  return entry.value;
}

export async function updateExhaustItemEvent(
  useItemEvent: ExhaustItemEvent,
): Promise<void> {
  const key = getExhaustItemEventKey(useItemEvent.id);
  await kv.set(key, useItemEvent);
}

export async function deleteExhaustItemEventById(id: string): Promise<void> {
  const key = getExhaustItemEventKey(id);
  await kv.delete(key);
}

export async function getPurchaseEventsByUserId(
  userId: string,
): Promise<PurchaseEvent[]> {
  const iter = kv.list({ prefix: [PURCHASE_EVENT_KEY_PREFIX] });
  const purchaseEvents: PurchaseEvent[] = [];
  for await (const res of iter) {
    const purchaseEvent = res.value as PurchaseEvent;
    if (purchaseEvent.userId === userId) {
      purchaseEvents.push(purchaseEvent);
    }
  }
  purchaseEvents.sort((a, b) => b.date.getTime() - a.date.getTime());
  return purchaseEvents;
}

export async function getPurchaseEventsByUserIdAndItemId(
  userId: string,
  itemId: string,
): Promise<PurchaseEvent[]> {
  const purchaseEvents = await getPurchaseEventsByUserId(userId);
  const output: PurchaseEvent[] = [];
  for (const purchaseEvent of purchaseEvents) {
    if (purchaseEvent.itemId === itemId) {
      output.push(purchaseEvent);
    }
  }
  return output;
}

export async function getLastPurchaseEventByUserIdAndItemId(
  userId: string,
  itemId: string,
): Promise<PurchaseEvent | null> {
  const purchaseEvents = await getPurchaseEventsByUserIdAndItemId(
    userId,
    itemId,
  );
  if (purchaseEvents.length === 0) {
    return null;
  }
  return purchaseEvents[purchaseEvents.length - 1];
}

export async function getExhaustItemEventsByUserId(
  userId: string,
): Promise<ExhaustItemEvent[]> {
  const iter = kv.list({ prefix: [EXHAUST_ITEM_EVENT_KEY_PREFIX] });
  const exhaustItemEvents: ExhaustItemEvent[] = [];
  for await (const res of iter) {
    const exhaustItemEvent = res.value as ExhaustItemEvent;
    if (exhaustItemEvent.userId === userId) {
      exhaustItemEvents.push(exhaustItemEvent);
    }
  }
  return exhaustItemEvents;
}

export async function getPayoutEventsByUserId(
  userId: string,
): Promise<PayoutEvent[]> {
  const iter = kv.list({ prefix: [PAYOUT_EVENT_KEY_PREFIX] });
  const payoutEvents: PayoutEvent[] = [];
  for await (const res of iter) {
    const payoutEvent = res.value as PayoutEvent;
    if (payoutEvent.userId === userId) {
      payoutEvents.push(payoutEvent);
    }
  }
  return payoutEvents;
}

export async function isUserAbleToPurchaseItem(
  userId: string,
  itemId: string,
): Promise<boolean> {
  const user = await getUserById(userId);
  if (user === null) {
    throw new Error("user does not exist");
  }
  const item = await getItemById(itemId);
  if (item === null) {
    throw new Error("item does not exist");
  }
  if (user.balance < item.price) {
    return false;
  }
  const lastPurchaseEvent = await getLastPurchaseEventByUserIdAndItemId(
    userId,
    itemId,
  );
  if (lastPurchaseEvent === null) {
    return true;
  }
  const daysSinceLastPurchase =
    (new Date().getTime() - lastPurchaseEvent.date.getTime()) / 1000 / 60 / 60 /
    24;
  return daysSinceLastPurchase >= item.daysBetweenAvailable;
}

export async function purchaseItem(
  userId: string,
  itemId: string,
): Promise<void> {
  const user = await getUserById(userId);
  if (user === null) {
    throw new Error("user does not exist");
  }
  const item = await getItemById(itemId);
  if (item === null) {
    throw new Error("item does not exist");
  }
  if (await isUserAbleToPurchaseItem(userId, itemId) === false) {
    throw new Error("user is not able to purchase item");
  }

  await createPurchaseEvent(userId, itemId, item.price);
  user.balance -= item.price;

  const itemIndex = user.items.findIndex((item) => item.id === itemId);
  if (itemIndex !== -1) {
    user.items[itemIndex].quantity += 1;
  } else {
    user.items.push({
      id: itemId,
      quantity: 1,
    });
  }
  await updateUser(user);
}

export async function payoutUser(
  userId: string,
  amount: number,
): Promise<void> {
  const user = await getUserById(userId);
  if (user === null) {
    throw new Error("user does not exist");
  }

  await createPayoutEvent(userId, amount);
  user.balance += amount;
  await updateUser(user);
}

export async function exhaustItem(
  userId: string,
  itemId: string,
): Promise<void> {
  const user = await getUserById(userId);
  if (user === null) {
    throw new Error("user does not exist");
  }
  const item = await getItemById(itemId);
  if (item === null) {
    throw new Error("item does not exist");
  }

  const itemIndex = user.items.findIndex((item) => item.id === itemId);
  if (itemIndex === -1) {
    throw new Error("user does not have item");
  }
  if (user.items[itemIndex].quantity === 0) {
    throw new Error("user does not have item");
  }

  await createExhaustItemEvent(userId, itemId);
  user.items[itemIndex].quantity -= 1;
  if (user.items[itemIndex].quantity === 0) {
    user.items.splice(itemIndex, 1);
  }
  await updateUser(user);
}

export async function isUserAbleToExhaustItem(
  userId: string,
  itemId: string,
): Promise<boolean> {
  const user = await getUserById(userId);
  if (user === null) {
    throw new Error("user does not exist");
  }
  const item = await getItemById(itemId);
  if (item === null) {
    throw new Error("item does not exist");
  }

  const itemIndex = user.items.findIndex((item) => item.id === itemId);
  if (itemIndex === -1) {
    return false;
  }
  return user.items[itemIndex].quantity > 0;
}
