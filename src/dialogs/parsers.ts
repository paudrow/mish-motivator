import * as db from "../db.ts";

export function parseYesOrNo(reply: string): boolean {
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

export function parseNumber(reply: string): number {
  const n = Number(reply);
  if (isNaN(n)) {
    throw new Error("Invalid number");
  }
  return n;
}

export async function parseUserId(reply: string): Promise<string> {
  const user = await db.getUserById(reply);
  if (!user) {
    throw new Error("Invalid user ID");
  }
  return reply;
}

export function makeParserForNumberRange(
  min: number,
  max: number,
): (reply: string) => number {
  if (min > max) {
    throw new Error(`Invalid range: min (${min}) > max (${max})`);
  }
  return (reply: string) => {
    const n = parseNumber(reply);
    if (n < min || n > max) {
      throw new Error(`Number must be between ${min} and ${max}`);
    }
    return n;
  };
}
