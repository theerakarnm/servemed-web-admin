import { db } from "~/db/db.server";
import { orders, orderItems, productVariants, products } from "~/db/schema";
import { eq } from "drizzle-orm";

export interface OrderItem {
  orderItemId: number;
  variantId: number;
  orderId: number;
  quantity: number;
  price: number;
  name: string | null;
}

export interface Order {
  orderId: number;
  customerName: string;
  totalAmount: number;
  currency: string;
  paymentVerified: boolean;
  status: string;
  orderedAt: Date;
  items?: OrderItem[];
}

export async function getOrders(): Promise<Order[]> {
  const orderList = await db.select().from(orders);
  return orderList.map((o) => ({
    ...o,
    totalAmount: Number(o.totalAmount),
    orderedAt: new Date(o.orderedAt),
  }));
}

export async function getOrder(id: number): Promise<Order | undefined> {
  const [order] = await db.select().from(orders).where(eq(orders.orderId, id));
  if (!order) return undefined;

  const items = await db
    .select({
      orderItemId: orderItems.orderItemId,
      variantId: orderItems.variantId,
      orderId: orderItems.orderId,
      quantity: orderItems.quantity,
      price: orderItems.price,
      name: products.name,
    })
    .from(orderItems)
    .leftJoin(productVariants, eq(orderItems.variantId, productVariants.variantId))
    .leftJoin(products, eq(productVariants.productId, products.productId))
    .where(eq(orderItems.orderId, id));

  return {
    ...order,
    totalAmount: Number(order.totalAmount),
    orderedAt: new Date(order.orderedAt),
    items: items.map((i) => ({
      ...i,
      price: Number(i.price),
    })),
  };
}
