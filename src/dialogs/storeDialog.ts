import * as db from "../db.ts";
import { type Item, type User } from "../interfaces.ts";
import { parseYesOrNo } from "./parsers.ts";
import { promptUser } from "./promptUser.ts";
import { items } from "../constants.ts";
import { formatPoints } from "./displays.ts";
import { promptUserToPickOption } from "./promptUserToPickOrExit.ts";

export async function storeDialog(userId: string) {
  console.log("Welcome to the store!\n");

  const user = await db.getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const itemsByStatus = await getItemsByStatus(userId);
  if (itemsByStatus.ableToPurchase.length === 0) {
    console.log("Sorry, there's nothing available right now.\n");
    return;
  }

  console.log("Here's what's not available:\n");
  for (const item of itemsByStatus.notAbleToPurchase) {
    console.log(`- ${formatItemInfo(user, item)}`);
  }
  console.log();
  console.log("Here's what's available:\n");
  const options = [
    ...itemsByStatus.ableToPurchase.map((item) => formatItemInfo(user, item)),
    "Nothing, thanks!",
  ];
  const optionIndex = await promptUserToPickOption(
    `Which item would you like to purchase? You have ${
      formatPoints(user.balance)
    }. (pick number)`,
    options,
  );
  const exitDisplayIndex = options.length - 1;
  if (optionIndex === exitDisplayIndex) {
    console.log("OK, maybe next time!");
    return;
  }
  const item = itemsByStatus.ableToPurchase[optionIndex];

  const isConfirmBuy = await promptUser(
    `Are you sure you want to purchase "${item.id}" for ${
      formatPoints(item.price)
    }? (y/n)`,
    parseYesOrNo,
  );
  if (!isConfirmBuy) {
    console.log("OK, maybe next time!");
    return;
  }

  if (await db.isUserAbleToPurchaseItem(userId, item.id)) {
    await db.purchaseItem(userId, item.id);
    console.log(`Congrats, you purchased "${item.id}"!`);
  } else {
    throw new Error("User should be able to purchase item but was not");
  }
}

function formatItemInfo(user: User, item: Item): string {
  const userInventory = user.items.find((i) => i.id === item.id)?.quantity || 0;
  return `${item.id} (${formatPoints(item.price)}) - you have ${userInventory}`;
}

interface ItemsByStatus {
  ableToPurchase: Item[];
  notAbleToPurchase: Item[];
}
async function getItemsByStatus(userId: string): Promise<ItemsByStatus> {
  const user = await db.getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const items = await db.getItems();
  const itemsByStatus: ItemsByStatus = {
    ableToPurchase: [],
    notAbleToPurchase: [],
  };
  for (const item of items) {
    if (await db.isUserAbleToPurchaseItem(userId, item.id)) {
      itemsByStatus.ableToPurchase.push(item);
    } else {
      itemsByStatus.notAbleToPurchase.push(item);
    }
  }

  // sort items by price
  itemsByStatus.ableToPurchase.sort((a, b) => a.price - b.price);
  itemsByStatus.notAbleToPurchase.sort((a, b) => a.price - b.price);

  return itemsByStatus;
}

if (import.meta.main) {
  const userId = "test";

  if (!await db.getUserById(userId)) {
    await db.reset();
    await db.createUser(userId, 100);

    let itemIdToBuy = "";
    for (const item of items) {
      if (item.price === 30) {
        itemIdToBuy = item.id;
      }
      await db.createItem(item.id, item.price, item.daysBetweenAvailable);
    }
    await db.purchaseItem(userId, itemIdToBuy);
  }

  await storeDialog(userId);
}
