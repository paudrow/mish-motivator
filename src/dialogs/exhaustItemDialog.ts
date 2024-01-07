import * as db from "../db.ts";
import { type Item } from "../interfaces.ts";
import { parseYesOrNo } from "./parsers.ts";
import { promptUser } from "./promptUser.ts";
import { items } from "../constants.ts";
import { promptUserToPickOption } from "./promptUserToPickOrExit.ts";

export async function exhaustItemDialog(userId: string) {
  const user = await db.getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  if (user.items.length === 0) {
    console.log("Sorry, but you have no items to use.\n");
    return;
  }

  console.log("Here are your items:\n");
  const options = [
    ...user.items.map((item) => formatItemInfo(item.id, item.quantity)),
    "Nothing for now, thanks!",
  ];
  const optionIndex = await promptUserToPickOption(
    `Which item would you like to use up? (pick number)`,
    options,
  );
  const exitDisplayIndex = options.length - 1;
  if (optionIndex === exitDisplayIndex) {
    console.log("OK, maybe next time!");
    return;
  }
  const itemId = user.items[optionIndex].id;

  const isConfirmBuy = await promptUser(
    `Are you sure you want to use up one "${itemId}"? (y/n)`,
    parseYesOrNo,
  );
  if (!isConfirmBuy) {
    console.log("OK, maybe next time!");
    return;
  }

  if (await db.isUserAbleToExhaustItem(userId, itemId)) {
    await db.exhaustItem(userId, itemId);
    console.log(`Congrats, you used "${itemId}"!`);
  } else {
    throw new Error("User should be able to exhaust item but was not");
  }
}

function formatItemInfo(itemId: string, itemQuantity: number): string {
  return `${itemId} - you have ${itemQuantity}`;
}

if (import.meta.main) {
  const userId = "test";
  const alwaysReset = false;

  if (!await db.getUserById(userId) || alwaysReset) {
    await db.reset();
    await db.createUser(userId, 100000); // obscenely high balance for testing

    for (const item of items) {
      await db.createItem(item.id, item.price, item.daysBetweenAvailable);
      if (await db.isUserAbleToPurchaseItem(userId, item.id)) {
        await db.purchaseItem(userId, item.id);
      } else {
        throw new Error("User should be able to purchase item but was not");
      }
    }
  }

  await exhaustItemDialog(userId);
}
