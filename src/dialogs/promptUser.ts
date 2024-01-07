export async function promptUser<T>(
  question: string,
  parser: (reply: string) => T,
  options?: {
    hideInputArea?: boolean;
    maxTries?: number;
  },
): Promise<T> {
  const promptText = options?.hideInputArea ? question : question + "\n>>>";

  let tries = 0;
  while (true) {
    const reply = prompt(promptText) ?? "";
    try {
      const result = parser(reply);
      console.log();
      if (result instanceof Promise) {
        return await result;
      } else {
        return result;
      }
    } catch (e) {
      console.log(e.message + "\n");
      tries++;
      if (options?.maxTries && tries >= options.maxTries) {
        throw new Error("Too many tries");
      }
    }
  }
}

if (import.meta.main) {
  try {
    const reply = await promptUser(
      "Guess the number!",
      (reply) => {
        reply = reply.trim();
        if (reply === "123") {
          return "123";
        } else {
          throw new Error("Not the correct number");
        }
      },
      {
        maxTries: 3,
      },
    );
    console.log(`Hello, ${reply}!`);
  } catch (e) {
    console.log(e.message);
    Deno.exit(1);
  }
}
