import * as db from "../src/db.ts";

if (import.meta.main) {
  await db.reset();
}
