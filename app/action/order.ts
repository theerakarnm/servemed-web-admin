import { db } from "~/db/db.server";
import {
  orders,
  payments,
  user,
  orderItems,
  products,
} from "~/db/schema";
import { eq } from "drizzle-orm";

export interface Order {
  orderId: number;
  customerName: string;
  totalAmount: number;
  currency: string;
  paymentVerified: boolean;
  status: string;
  orderedAt: Date;
}

export async function getOrders(): Promise<Order[]> {
  const rows = await db
    .select({
      orderId: orders.id,
      customerName: user.name,
      totalAmount: orders.totalAmount,
      currency: orders.currency,
      paymentStatus: payments.status,
      status: orders.status,
      orderedAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(user, eq(orders.userId, user.id))
    .leftJoin(payments, eq(payments.orderId, orders.id));

  return rows.map((r) => ({
    orderId: r.orderId,
    customerName: r.customerName ?? "Unknown",
    totalAmount: Number(r.totalAmount),
    currency: r.currency,
    paymentVerified: r.paymentStatus === "successful",
    status: r.status,
    orderedAt: r.orderedAt,
  }));
}

export async function getOrderDetail(id: number) {
  const [order] = await db
    .select({
      id: orders.id,
      userId: orders.userId,
      status: orders.status,
      totalAmount: orders.totalAmount,
      currency: orders.currency,
      createdAt: orders.createdAt,
      notes: orders.notes,
      customerName: user.name,
      paymentStatus: payments.status,
      paymentProviderDetails: payments,
    })
    .from(orders)
    .leftJoin(user, eq(orders.userId, user.id))
    .leftJoin(payments, eq(payments.orderId, orders.id))
    .where(eq(orders.id, id));

  if (!order) return null;

  const items = await db
    .select({
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      price: orderItems.priceAtPurchase,
      name: products.name,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.productId))
    .where(eq(orderItems.orderId, id));

  return {
    ...order,
    totalAmount: Number(order.totalAmount),
    paymentProviderDetails: order.paymentProviderDetails as unknown as Record<string, unknown> | null,
    items: items.map((i) => ({
      ...i,
      price: Number(i.price),
    })),
  };
}

export async function verifyPayment(orderId: number) {
  await db.transaction(async (tx) => {
    await tx
      .update(payments)
      .set({ status: "successful" })
      .where(eq(payments.orderId, orderId));
    await tx
      .update(orders)
      .set({ status: "processing" })
      .where(eq(orders.id, orderId));
  });
}

export async function cancelOrder(orderId: number) {
  await db
    .update(orders)
    .set({ status: "cancelled" })
    .where(eq(orders.id, orderId));
}