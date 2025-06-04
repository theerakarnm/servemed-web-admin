import { db } from "~/db/db.server";
import {
  orders,
  payments,
  user,
  orderItems,
  products,
  orderStatusEnum,
  paymentStatusEnum,
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

export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
  "failed",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = [
  "pending",
  "successful",
  "failed",
  "refunded",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

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
      paymentSlip: orders.paymentSlip,
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

export async function updateOrderStatus(orderId: number, status: OrderStatus) {
  await db.update(orders).set({ status }).where(eq(orders.id, orderId));
}

export async function updatePaymentStatus(
  orderId: number,
  status: PaymentStatus,
) {
  await db
    .update(payments)
    .set({ status })
    .where(eq(payments.orderId, orderId));
}