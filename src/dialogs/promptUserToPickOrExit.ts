import { promptUser } from "./promptUser.ts";
import { makeParserForNumberRange } from "./parsers.ts";

export async function promptUserToPickOption(
  question: string,
  options: string[],
): Promise<number> {
  for (let i = 0; i < options.length; i++) {
    console.log(`${i + 1}: ${options[i]}`);
  }
  console.log();
  const itemIndex =
    (await promptUser(question, makeParserForNumberRange(1, options.length))) -
    1;
  return itemIndex;
}
