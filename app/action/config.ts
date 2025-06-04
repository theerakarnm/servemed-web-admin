import { configTable } from "../db/schema";
import { db } from "~/db/db.server";
import { eq } from "drizzle-orm";

export async function getConfig(key: string) {
  const result = await db
    .select()
    .from(configTable)
    .where(eq(configTable.key, key))
    .limit(1);
  return result[0];
}

export async function upsertConfig(key: string, value: unknown, userId = "system") {
  const existing = await getConfig(key);
  if (existing) {
    await db
      .update(configTable)
      .set({ value, updatedBy: userId, updatedAt: new Date() })
      .where(eq(configTable.key, key));
  } else {
    await db.insert(configTable).values({
      key,
      value,
      createdBy: userId,
      updatedBy: userId,
    });
  }
}
