import { getPayoutTicket, getPayoutValue } from "../src/payout.ts";
import { PAYOUT_TICKETS } from "../src/constants.ts";
import { formatCurrency } from "../src/dialogs/displays.ts";

if (import.meta.main) {
  let payoutSum = 0;
  const numberOfTrials = 100000;

  const recordCount: Record<string, number> = {};
  for (let i = 0; i < numberOfTrials; i++) {
    const payoutTicket = getPayoutTicket(PAYOUT_TICKETS);
    const payoutValue = getPayoutValue(payoutTicket);
    payoutSum += payoutValue;

    const payoutType = payoutTicket?.name ?? "No payout";
    if (recordCount[payoutType]) {
      recordCount[payoutType] += 1;
    } else {
      recordCount[payoutType] = 1;
    }
  }

  const averagePayout = payoutSum / numberOfTrials;
  console.log(`Average payout: ${formatCurrency(averagePayout)}\n`);

  console.log("\nDistribution of payouts:");
  const sortedRecordCount = Object.entries(recordCount).sort((a, b) => {
    return b[1] - a[1];
  });
  for (const [payoutType, count] of sortedRecordCount) {
    const percentage = count / numberOfTrials * 100;
    console.log(`${payoutType}:\t\t${percentage.toFixed(2)}%`);
  }
}
