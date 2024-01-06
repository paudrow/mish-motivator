import { getReward, type Reward, sampleReward } from "./src/reward.ts";

interface User {
  id: number;
  name: string;
  balance: number;
}

if (import.meta.main) {
  const rewards: Reward[] = [
    {
      name: "default",
      mean: 5,
      stdDev: 1,
      odds: 1.0,
    },
    {
      name: "small",
      mean: 10,
      stdDev: 2,
      odds: 0.25,
    },
    {
      name: "medium",
      mean: 20,
      stdDev: 5,
      odds: 0.1,
    },
    {
      name: "large",
      mean: 50,
      stdDev: 10,
      odds: 0.05,
    },
    {
      name: "jackpot",
      mean: 100,
      stdDev: 20,
      odds: 0.01,
    },
  ];

  let sum = 0;
  for (let i = 0; i < 10000; i++) {
    const reward = getReward(rewards);
    const value = sampleReward(reward);
    sum += value;
  }
  console.log(sum / 10000);

  const kv = await Deno.openKv();
  await kv.set(["user", 1], "audrow");
  await kv.set(["user", 2], "mish");
  // console.log(out);
  const users = [];
  const iter = kv.list({ prefix: ["user"] });
  for await (const res of iter) users.push(res);
  console.log(users);
}
