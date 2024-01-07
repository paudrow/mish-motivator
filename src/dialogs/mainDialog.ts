import * as db from "../db.ts";
import { parseYesOrNo } from "./parsers.ts";
import { promptUser } from "./promptUser.ts";
import { promptUserToPickOption } from "./promptUserToPickOrExit.ts";
import { storeDialog } from "./storeDialog.ts";
import { exhaustItemDialog } from "./exhaustItemDialog.ts";
import { payoutDialog } from "./payoutDialog.ts";
import { formatPoints } from "./displays.ts";

export async function mainDialog() {
  console.log("Welcome to the Mish Motivator!\n");

  const userId = await promptUser("What's your user ID?", (reply) => reply);

  const user = await db.getUserById(userId);
  if (!user) {
    console.log("Sorry, I don't recognize you.\n");
    const isCreateUser = await promptUser(
      "Would you like to create a new user? (y/n)",
      parseYesOrNo,
    );
    if (!isCreateUser) {
      console.log("OK, maybe next time!");
      return;
    }
    await db.createUser(userId, 0);
  }

  while (true) {
    const optionIndex = await promptUserToPickOption(
      "What would you like to do?",
      [
        "Store",
        "Use your items",
        "Payout",
        "Check balance",
        "Quit",
      ],
    );
    switch (optionIndex) {
      case 0:
        await storeDialog(userId);
        await waitForEnter();
        break;
      case 1:
        await exhaustItemDialog(userId);
        await waitForEnter();
        break;
      case 2:
        await payoutDialog(userId);
        await waitForEnter();
        break;
      case 3:
        await checkBalance(userId);
        await waitForEnter();
        break;
      case 4:
        console.log("OK, maybe next time!");
        return;
      default:
        throw new Error("Invalid option");
    }
  }
}

async function waitForEnter() {
  return await promptUser("<hit enter>", (reply) => reply, {
    hideInputArea: true,
  });
}

async function checkBalance(userId: string) {
  const user = await db.getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  console.log(`Your balance is ${formatPoints(user.balance)}\n`);
}
