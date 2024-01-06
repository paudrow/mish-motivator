import {
  assertAlmostEquals,
  assertEquals,
  fail,
} from "https://deno.land/std@0.211.0/assert/mod.ts";
import { getReward, type Reward, sampleReward } from "./reward.ts";

Deno.test("get Reward has reasonable picking behavior", () => {
  const DEFAULT = "default";
  const LESS_FREQUENT = "less frequent";
  const rewards: Reward[] = [
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
  ];

  const count: Record<string, number> = {
    [DEFAULT]: 0,
    [LESS_FREQUENT]: 0,
  };

  for (let i = 0; i < 1000; i++) {
    const reward = getReward(rewards);
    if (reward === null) {
      fail("with the default reward, there should always be a reward");
    }

    switch (reward?.name) {
      case DEFAULT:
        count[DEFAULT] += 1;
        break;
      case LESS_FREQUENT:
        count[LESS_FREQUENT] += 1;
        break;
    }
  }
  assertAlmostEquals(
    count[DEFAULT],
    750,
    100,
    "the default reward should be picked 75% of the time",
  );
  assertAlmostEquals(
    count[LESS_FREQUENT],
    250,
    100,
    "the less frequent reward should be picked 25% of the time",
  );
});

Deno.test("get Reward can return null", () => {
  const LESS_FREQUENT = "less frequent";
  const NO_REWARD = "no reward";
  const rewards: Reward[] = [
    {
      name: LESS_FREQUENT,
      mean: 10,
      stdDev: 2,
      odds: 0.25,
    },
  ];

  const count: Record<string, number> = {
    [LESS_FREQUENT]: 0,
    [NO_REWARD]: 0,
  };

  for (let i = 0; i < 1000; i++) {
    const reward = getReward(rewards);
    if (reward === null) {
      count[NO_REWARD] += 1;
      continue;
    } else if (reward.name === LESS_FREQUENT) {
      count[LESS_FREQUENT] += 1;
    } else {
      fail("should not be possible");
    }
  }

  assertAlmostEquals(
    count[NO_REWARD],
    750,
    100,
    "no reward should be picked 75% of the time",
  );
  assertAlmostEquals(
    count[LESS_FREQUENT],
    250,
    100,
    "the less frequent reward should be picked 25% of the time",
  );
});

Deno.test("sample reward", () => {
  for (let i = 0; i < 100; i++) {
    const reward = {
      name: "default",
      mean: 5,
      stdDev: 0.0,
      odds: 1.0,
    };
    const value = sampleReward(reward);
    assertEquals(
      value,
      5,
      "with a stdDev of 0, the value should always be the mean",
    );
  }

  for (let i = 0; i < 100; i++) {
    const reward = {
      name: "default",
      mean: 5,
      stdDev: 0.25,
      odds: 1.0,
    };
    const value = sampleReward(reward);
    assertAlmostEquals(
      value,
      5,
      2,
      "with a stdDev of 0.25, the value should be close to the mean",
    );
  }
});
