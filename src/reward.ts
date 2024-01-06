export interface Reward {
  name: string;
  mean: number;
  stdDev: number;
  odds: number;
}

export function getReward(rewards: Reward[]): Reward | null {
  rewards.sort((a, b) => a.odds - b.odds);
  const rand = Math.random();
  for (const reward of rewards) {
    if (rand <= reward.odds) {
      return reward;
    }
  }
  return null;
}

function gaussianRandom(mean: number, stdDev: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * stdDev + mean;
}

export function sampleReward(reward: Reward | null): number {
  if (reward === null) {
    return 0;
  }
  return gaussianRandom(reward.mean, reward.stdDev);
}
