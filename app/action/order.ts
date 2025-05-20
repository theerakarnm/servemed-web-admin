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
  // TODO: replace with real database call
  return [
    {
      orderId: 1,
      customerName: "John Doe",
      totalAmount: 49.99,
      currency: "USD",
      paymentVerified: false,
      status: "Pending",
      orderedAt: new Date(),
    },
    {
      orderId: 2,
      customerName: "Jane Smith",
      totalAmount: 79.5,
      currency: "USD",
      paymentVerified: true,
      status: "Completed",
      orderedAt: new Date(),
    },
  ];
}
