import * as db from "./db.ts";

import {
  assert,
  assertEquals,
  assertFalse,
  fail,
} from "https://deno.land/std@0.211.0/assert/mod.ts";

Deno.makeTempFileSync();

Deno.test("CRUD user", async () => {
  await db.reset();

  const USER_ID = "audrow";
  const STARTING_BALANCE = 0;

  {
    const user = await db.getUserById(USER_ID);
    assertEquals(user, null);
  }

  await db.createUser(USER_ID, STARTING_BALANCE);

  {
    const user = await db.getUserById(USER_ID);
    if (user === null) {
      fail("user should not be null");
    }
    assertEquals(user.id, USER_ID);
    assertEquals(user.balance, STARTING_BALANCE);

    user.balance += 100;
    await db.updateUser(user);
  }
  {
    const user = await db.getUserById(USER_ID);
    if (user === null) {
      fail("user should not be null");
    }
    assertEquals(user.id, USER_ID);
    assertEquals(user.balance, STARTING_BALANCE + 100);
  }

  await db.deleteUserById(USER_ID);
  const deletedUser = await db.getUserById(USER_ID);
  assertEquals(deletedUser, null);
});

Deno.test("CRUD item", async () => {
  await db.reset();

  const ITEM_NAME = "mac";
  const PRICE = 100;
  const DAYS_BETWEEN = 0;

  const itemId = await db.createItem(ITEM_NAME, PRICE, DAYS_BETWEEN);

  {
    const item = await db.getItemById(itemId);
    if (item === null) {
      fail("item should not be null");
    }

    assertEquals(item.price, PRICE);
    assertEquals(item.daysBetweenAvailable, DAYS_BETWEEN);

    item.price += 100;
    item.daysBetweenAvailable += 1;
    await db.updateItem(item);
  }

  {
    const item = await db.getItemById(itemId);
    if (item === null) {
      fail("item should not be null");
    }

    assertEquals(item.price, PRICE + 100);
    assertEquals(item.daysBetweenAvailable, DAYS_BETWEEN + 1);
  }

  await db.deleteItemById(ITEM_NAME);
  const deletedItem = await db.getItemById(ITEM_NAME);
  assertEquals(deletedItem, null);
});

Deno.test("CRUD payout event", async () => {
  await db.reset();

  const USER_ID = "audrow";
  const AMOUNT = 100;

  const payoutEventId = await db.createPayoutEvent(USER_ID, AMOUNT);
  {
    const payoutEvent = await db.getPayoutEventById(payoutEventId);
    if (payoutEvent === null) {
      fail("payoutEvent should not be null");
    }

    assertEquals(payoutEvent.userId, USER_ID);
    assertEquals(payoutEvent.amount, AMOUNT);

    const events = await db.getPayoutEventsByUserId(USER_ID);
    assertEquals(events.length, 1);
    assertEquals(events[0].id, payoutEventId);

    payoutEvent.amount += 100;
    await db.updatePayoutEvent(payoutEvent);
  }

  {
    const payoutEvent = await db.getPayoutEventById(payoutEventId);
    if (payoutEvent === null) {
      fail("payoutEvent should not be null");
    }

    assertEquals(payoutEvent.userId, USER_ID);
    assertEquals(payoutEvent.amount, AMOUNT + 100);
  }

  await db.deletePayoutEventById(payoutEventId);
  const deletedPayoutEvent = await db.getPayoutEventById(payoutEventId);
  assertEquals(deletedPayoutEvent, null);
});

Deno.test("CRUD purchase event", async () => {
  await db.reset();

  const USER_ID = "audrow";
  const ITEM_ID = "mac";
  const ITEM_COST = 100;

  const purchaseEventId = await db.createPurchaseEvent(
    USER_ID,
    ITEM_ID,
    ITEM_COST,
  );
  {
    const purchaseEvent = await db.getPurchaseEventById(purchaseEventId);
    if (purchaseEvent === null) {
      fail("purchaseEvent should not be null");
    }

    assertEquals(purchaseEvent?.userId, USER_ID);
    assertEquals(purchaseEvent?.itemId, ITEM_ID);

    const events = await db.getPurchaseEventsByUserId(USER_ID);
    assertEquals(events.length, 1);
    assertEquals(events[0].id, purchaseEventId);

    purchaseEvent.cost += 100;
    await db.updatePurchaseEvent(purchaseEvent);
  }

  {
    const purchaseEvent = await db.getPurchaseEventById(purchaseEventId);
    if (purchaseEvent === null) {
      fail("purchaseEvent should not be null");
    }

    assertEquals(purchaseEvent?.userId, USER_ID);
    assertEquals(purchaseEvent?.itemId, ITEM_ID);
    assertEquals(purchaseEvent?.cost, ITEM_COST + 100);
  }

  await db.deletePurchaseEventById(purchaseEventId);
  const deletedPurchaseEvent = await db.getPurchaseEventById(purchaseEventId);
  assertEquals(deletedPurchaseEvent, null);
});

Deno.test("create and delete exhaust item event", async () => {
  await db.reset();

  const USER_ID = "audrow";
  const ITEM_ID = "mac";
  const exhaustItemEventId = await db.createExhaustItemEvent(USER_ID, ITEM_ID);
  {
    const exhaustItemEvent = await db.getExhaustItemEventById(
      exhaustItemEventId,
    );
    if (exhaustItemEvent === null) {
      fail("exhaustItemEvent should not be null");
    }

    assertEquals(exhaustItemEvent.userId, USER_ID);
    assertEquals(exhaustItemEvent.itemId, ITEM_ID);

    const events = await db.getExhaustItemEventsByUserId(USER_ID);
    assertEquals(events.length, 1);
    assertEquals(events[0].id, exhaustItemEventId);

    exhaustItemEvent.itemId = "new item id";
    await db.updateExhaustItemEvent(exhaustItemEvent);
  }

  {
    const exhaustItemEvent = await db.getExhaustItemEventById(
      exhaustItemEventId,
    );
    if (exhaustItemEvent === null) {
      fail("exhaustItemEvent should not be null");
    }

    assertEquals(exhaustItemEvent.userId, USER_ID);
    assertEquals(exhaustItemEvent.itemId, "new item id");
  }

  await db.deleteExhaustItemEventById(exhaustItemEventId);
  const deletedExhaustItemEvent = await db.getExhaustItemEventById(
    exhaustItemEventId,
  );
  assertEquals(deletedExhaustItemEvent, null);
});

Deno.test("purchasing workflow and deletion", async () => {
  await db.reset();

  const USER_ID = "audrow";

  await db.createUser(USER_ID, 0);

  assertEquals((await db.getItems()).length, 0);
  const macId = await db.createItem("mac", 100, 0);
  const reclinerId = await db.createItem("recliner", 200, 0);
  assertEquals((await db.getItems()).length, 2);

  assertEquals((await db.getExhaustItemEventsByUserId(USER_ID)).length, 0);
  assertEquals((await db.getPurchaseEventsByUserId(USER_ID)).length, 0);

  assertEquals((await db.getPayoutEventsByUserId(USER_ID)).length, 0);
  await db.payoutUser(USER_ID, 200);
  assertEquals((await db.getPayoutEventsByUserId(USER_ID)).length, 1);
  await db.payoutUser(USER_ID, 300);
  assertEquals((await db.getPayoutEventsByUserId(USER_ID)).length, 2);

  {
    const user = await db.getUserById(USER_ID);
    if (user === null) {
      fail("user should not be null");
    }
    assertEquals(user.id, USER_ID);
    assertEquals(user.balance, 500);
    assertEquals(user.items.length, 0);
  }

  for (let i = 0; i < 2; i++) {
    if (await db.isUserAbleToPurchaseItem(USER_ID, macId)) {
      await db.purchaseItem(USER_ID, macId);
    } else {
      fail("user should be able to purchase item");
    }
  }

  assertEquals((await db.getPurchaseEventsByUserId(USER_ID)).length, 2);

  {
    const user = await db.getUserById(USER_ID);
    if (user === null) {
      fail("user should not be null");
    }
    assertEquals(user.id, USER_ID);
    assertEquals(user.balance, 300);
    assertEquals(user.items.length, 1);
  }

  if (await db.isUserAbleToPurchaseItem(USER_ID, reclinerId)) {
    await db.purchaseItem(USER_ID, reclinerId);
  } else {
    fail("user should be able to purchase item");
  }

  assertEquals((await db.getPurchaseEventsByUserId(USER_ID)).length, 3);

  {
    const user = await db.getUserById(USER_ID);
    if (user === null) {
      fail("user should not be null");
    }
    assertEquals(user.id, USER_ID);
    assertEquals(user.balance, 100);
    assertEquals(user.items.length, 2);
  }

  if (await db.isUserAbleToExhaustItem(USER_ID, macId)) {
    await db.exhaustItem(USER_ID, macId);
  } else {
    fail("user should be able to exhaust item");
  }

  assert(
    await db.isUserAbleToExhaustItem(USER_ID, macId),
    "mac should already be exhausted",
  );
  assertEquals((await db.getExhaustItemEventsByUserId(USER_ID)).length, 1);

  if (await db.isUserAbleToExhaustItem(USER_ID, macId)) {
    await db.exhaustItem(USER_ID, macId);
  } else {
    fail("user should be able to exhaust item");
  }

  assertFalse(
    await db.isUserAbleToExhaustItem(USER_ID, macId),
    "mac should already be exhausted",
  );
  assertEquals((await db.getExhaustItemEventsByUserId(USER_ID)).length, 2);

  {
    const user = await db.getUserById(USER_ID);
    if (user === null) {
      fail("user should not be null");
    }
    assertEquals(user.items.length, 1);
  }

  // Check that records are deleted when user is deleted
  await db.deleteUserById(USER_ID);
  assertEquals(await db.getUserById(USER_ID), null);
  assertEquals((await db.getExhaustItemEventsByUserId(USER_ID)).length, 0);
  assertEquals((await db.getPurchaseEventsByUserId(USER_ID)).length, 0);
  assertEquals((await db.getPayoutEventsByUserId(USER_ID)).length, 0);
  assertEquals((await db.getItems()).length, 2);
});
