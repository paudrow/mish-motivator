import * as db from "./db.ts";
import { getPayoutTicket, getPayoutValue, PayoutTicket } from "./payout.ts";

function parseYesOrNo(reply: string): boolean {
  reply = reply.toLowerCase();
  switch (reply) {
    case "y":
    case "yes":
    case "yep":
    case "yeah":
    case "yup":
      return true;
    case "n":
    case "no":
    case "nope":
    case "nah":
      return false;
    default:
      throw new Error("Invalid reply");
  }
}

function parseNumber(reply: string): number {
  const n = Number(reply);
  if (isNaN(n)) {
    throw new Error("Invalid number");
  }
  return n;
}

async function parseUserId(reply: string): Promise<string> {
  const user = await db.getUserById(reply);
  if (!user) {
    throw new Error("Invalid user ID");
  }
  return reply;
}

async function promptUser<T>(
  question: string,
  parser: (reply: string) => T,
): Promise<T> {
  while (true) {
    const reply = prompt(question + "\n>>>") ?? "";
    try {
      const result = parser(reply);
      console.log();
      if (result instanceof Promise) {
        return await result;
      } else {
        return result;
      }
    } catch (e) {
      console.log(e.message);
    }
  }
}

const payoutTickets: PayoutTicket[] = [
  {
    name: "Small payout",
    mean: 5,
    stdDev: 1,
    odds: 1.0,
  },
  {
    name: "Medium payout",
    mean: 10,
    stdDev: 2,
    odds: 0.25,
  },
  {
    name: "Large payout",
    mean: 20,
    stdDev: 3,
    odds: 0.1,
  },
  {
    name: "Jackpot!",
    mean: 50,
    stdDev: 4,
    odds: 0.05,
  },
];

async function payoutDialog() {
  console.log("Welcome to the payout calculator!\n");

  await db.reset();
  await db.createUser("mish", 0);

  const userId = await promptUser("What is your user ID?", parseUserId);
  console.log(`Hello, ${userId}!\n`);

  const isCompleted = await promptUser(
    "Did you complete your task today? (y/n)",
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
  console.log("Nice!\n");

  let payoutSum = 0;
  for (let i = 0; i < numPayouts; i++) {
    await promptUser(
      `Payout ${i + 1}: Hit <enter> to see how much you've earned!`,
      (reply) => reply,
    );
    const ticket = getPayoutTicket(payoutTickets);
    if (!ticket) {
      console.log("Sorry, you didn't win anything this time.");
      continue;
    }
    const payout = getPayoutValue(ticket);
    console.log(`${ticket.name}: You earned ${payout.toFixed(2)}\n`);
    payoutSum += payout;
  }

  {
    const user = await db.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.balance += payoutSum;
    await db.updateUser(user);
    console.log(`Your new balance is ${user.balance.toFixed(2)}\n`);
  }

  console.log("Thanks for playing!");
}

await payoutDialog();
