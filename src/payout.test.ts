import {
  assertAlmostEquals,
  assertEquals,
  fail,
} from "https://deno.land/std@0.211.0/assert/mod.ts";
import {
  getPayoutTicket,
  getPayoutValue,
  type PayoutTicket,
} from "./payout.ts";

Deno.test("getPayoutTicket has reasonable picking behavior", () => {
  const DEFAULT = "default";
  const LESS_FREQUENT = "less frequent";
  const EVEN_LESS_FREQUENT = "even less frequent";
  const NEVER = "never";

  const tickets: PayoutTicket[] = [
    {
      name: DEFAULT,
      mean: 5,
      stdDev: 1,
      odds: 1.0,
    },
    {
      name: LESS_FREQUENT,
      mean: 10,
      stdDev: 2,
      odds: 0.25,
    },
    {
      name: EVEN_LESS_FREQUENT,
      mean: 20,
      stdDev: 5,
      odds: 0.1,
    },
    {
      name: NEVER,
      mean: 2000,
      stdDev: 10,
      odds: 0.0,
    },
  ];

  const count: Record<string, number> = {
    [DEFAULT]: 0,
    [LESS_FREQUENT]: 0,
    [EVEN_LESS_FREQUENT]: 0,
  };

  for (let i = 0; i < 1000; i++) {
    const ticket = getPayoutTicket(tickets);
    if (ticket === null) {
      fail("with the default, there should always be a payout ticket");
    }

    switch (ticket?.name) {
      case DEFAULT:
        count[DEFAULT] += 1;
        break;
      case LESS_FREQUENT:
        count[LESS_FREQUENT] += 1;
        break;
      case EVEN_LESS_FREQUENT:
        count[EVEN_LESS_FREQUENT] += 1;
        break;
      case NEVER:
        fail("the never ticket should never be picked");
    }
  }
  assertAlmostEquals(
    count[DEFAULT],
    650,
    150,
    "the default payout should be picked 65% of the time",
  );
  assertAlmostEquals(
    count[LESS_FREQUENT],
    250,
    150,
    "the less frequent payout should be picked 25% of the time",
  );
  assertAlmostEquals(
    count[EVEN_LESS_FREQUENT],
    100,
    150,
    "the even less frequent payout should be picked 10% of the time",
  );
});

Deno.test("getPayoutTicket can return null", () => {
  const LESS_FREQUENT = "less frequent";
  const NO_PAYOUT = "none";
  const tickets: PayoutTicket[] = [
    {
      name: LESS_FREQUENT,
      mean: 10,
      stdDev: 2,
      odds: 0.25,
    },
  ];

  const count: Record<string, number> = {
    [LESS_FREQUENT]: 0,
    [NO_PAYOUT]: 0,
  };

  for (let i = 0; i < 1000; i++) {
    const ticket = getPayoutTicket(tickets);
    if (ticket === null) {
      count[NO_PAYOUT] += 1;
      continue;
    } else if (ticket.name === LESS_FREQUENT) {
      count[LESS_FREQUENT] += 1;
    } else {
      fail("should not be possible");
    }
  }

  assertAlmostEquals(
    count[NO_PAYOUT],
    750,
    150,
    "no payout ticket should be picked 75% of the time",
  );
  assertAlmostEquals(
    count[LESS_FREQUENT],
    250,
    150,
    "the less frequent payout ticket should be picked 25% of the time",
  );
});

Deno.test("getPayoutValue returns mean with 0 standard deviation", () => {
  for (let i = 0; i < 100; i++) {
    const ticket = {
      name: "default",
      mean: 5,
      stdDev: 0.0,
      odds: 1.0,
    };
    const value = getPayoutValue(ticket);
    assertEquals(
      value,
      5,
      "with a stdDev of 0, the value should always be the mean",
    );
  }
});

Deno.test("getPayoutValue with mean and standard deviation", () => {
  for (let i = 0; i < 100; i++) {
    const ticket = {
      name: "default",
      mean: 5,
      stdDev: 0.25,
      odds: 1.0,
    };
    const value = getPayoutValue(ticket);
    assertAlmostEquals(
      value,
      5,
      2,
      "with a stdDev of 0.25, the value should be close to the mean",
    );
  }
});
