import * as db from "../db.ts";
import { getPayoutTicket, getPayoutValue } from "../payout.ts";
import { PAYOUT_TICKETS } from "../constants.ts";
import { parseNumber, parseYesOrNo } from "./parsers.ts";
import { promptUser } from "./promptUser.ts";
import { formatCurrency } from "./displays.ts";

export async function payoutDialog(userId: string) {
  console.log("Let's see how much you earned today!\n");

  const isCompleted = await promptUser(
    "Did you complete your tasks? (y/n)",
    parseYesOrNo,
  );
  if (isCompleted) {
    console.log("Great job!\n");
  } else {
    console.log("You can do it tomorrow!\n");
    return;
  }

  const numPayouts = await promptUser(
    "How many payouts did you earn?",
    parseNumber,
  );
  console.log("Nice! Let's see what you won 👀\n");

  let payoutSum = 0;
  for (let i = 0; i < numPayouts; i++) {
    await promptUser(
      `Let's see what you get for payout ${i + 1}. <hit enter>`,
      (reply) => reply,
      {
        hideInputArea: true,
      },
    );
    const ticket = getPayoutTicket(PAYOUT_TICKETS);
    if (!ticket) {
      console.log("Sorry, you didn't win anything this time.");
      continue;
    }
    const payout = getPayoutValue(ticket);
    console.log(`${ticket.name}: You earned ${formatCurrency(payout)}\n`);
    payoutSum += payout;
  }

  {
    const user = await db.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (payoutSum > 0) {
      user.balance += payoutSum;
      await db.updateUser(user);
      console.log(
        `You earned ${formatCurrency(payoutSum)} today! Your new balance is ${
          formatCurrency(user.balance)
        }\n`,
      );
    } else {
      console.log(
        `Sorry, you didn't win anything this time. Your balance is ${
          formatCurrency(user.balance)
        }\n`,
      );
    }
  }

  console.log("Thanks for playing!");
}

if (import.meta.main) {
  const userId = "test";
  const alwaysReset = false;

  if (!await db.getUserById(userId) || alwaysReset) {
    await db.reset();
    await db.createUser(userId, 0);
  }

  await payoutDialog(userId);
}
