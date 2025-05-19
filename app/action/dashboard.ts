import { db } from "~/db/db.server";
import { products, brands, categories, productVariants, productCategories } from "../db/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function getDashboardData() {
  const [{ count: totalProducts }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(products);

  const [{ count: totalBrands }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(brands);

  const [{ count: totalCategories }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(categories);

  const [{ count: totalVariants }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(productVariants);

  const recentProducts = await db
    .select({
      productId: products.productId,
      name: products.name,
      brandName: brands.name,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.brandId))
    .orderBy(desc(products.createdAt))
    .limit(10);

  const topCategories = await db
    .select({
      categoryId: categories.categoryId,
      name: categories.name,
      productCount: sql<number>`count(${productCategories.productId})`.as(
        "productCount",
      ),
    })
    .from(categories)
    .leftJoin(
      productCategories,
      eq(categories.categoryId, productCategories.categoryId),
    )
    .groupBy(categories.categoryId, categories.name)
    .orderBy(desc(sql<number>`count(${productCategories.productId})`))
    .limit(5);

  return {
    totals: {
      products: totalProducts ?? 0,
      brands: totalBrands ?? 0,
      categories: totalCategories ?? 0,
      variants: totalVariants ?? 0,
    },
    recentProducts,
    topCategories,
  };
}
