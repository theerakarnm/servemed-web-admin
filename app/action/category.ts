import { categories } from "@workspace/db/src/schema";
import { and, eq, gt, isNull, like, or } from "drizzle-orm";
import { db } from '../../../../packages/db/src/index';

// Category actions
export async function getCategories({
  context,
  cursor
}: {
  context?: string
  cursor?: number
} = {}) {
  return await db.select().from(categories)
    .where(
      and(
        context ? like(categories.name, context) : undefined,
        cursor ? gt(categories.categoryId, cursor) : undefined,
        isNull(categories.deletedAt),
      )
    );
}

export async function getCategory(id: number) {
  const result = await db.select().from(categories).where(eq(categories.categoryId, id));
  return result[0];
}
export async function createCategory(data: typeof categories.$inferInsert) {
  await db.insert(categories).values(data);
}
export async function updateCategory(id: number, data: Partial<typeof categories.$inferInsert>) {
  await db.update(categories).set(data).where(eq(categories.categoryId, id));
}

export async function createCategories(data: typeof categories.$inferInsert[]) {
  await db.insert(categories).values(data);
}

export async function deleteCategory(id: number) {
  await db.delete(categories).where(eq(categories.categoryId, id));
}
