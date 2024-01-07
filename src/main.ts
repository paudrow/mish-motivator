import { mainDialog } from "./dialogs/mod.ts";
import * as db from "./db.ts";
import { ITEMS } from "./constants.ts";

if (import.meta.main) {
  // Make sure items are in the database
  if ((await db.getItems()).length === 0) {
    await db.reset();
    for (const item of ITEMS) {
      await db.createItem(item.id, item.price, item.daysBetweenAvailable);
    }
  }

  // Run it!
  await mainDialog();
}
