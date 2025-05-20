import { Link, useLoaderData } from "@remix-run/react";
import MainLayout from "~/layouts/MainLayout";
import { getOrder } from "~/action/order";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";

export default function OrderDetailPage() {
  const { order } = useLoaderData<typeof loader>();

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order #{order.orderId}</h1>
            <p className="text-muted-foreground">{order.customerName}</p>
          </div>
          <Link to="/orders">
            <Button variant="outline">Back to Orders</Button>
          </Link>
        </div>

        <div className="space-y-2">
          <p>Status: {order.status}</p>
          <p>Payment: {order.paymentVerified ? "Verified" : "Pending"}</p>
          <p>
            Total: {order.currency} {order.totalAmount.toFixed(2)}
          </p>
          <p>Ordered At: {new Date(order.orderedAt).toLocaleString()}</p>
        </div>

        {order.items && order.items.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.orderItemId}>
                    <TableCell>{item.name || item.variantId}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      {order.currency} {item.price.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export async function loader({ params }: { params: { id: string } }) {
  const orderId = Number.parseInt(params.id);

  if (Number.isNaN(orderId)) {
    throw new Response("Invalid order ID", { status: 400 });
  }

  const order = await getOrder(orderId);

  if (!order) {
    throw new Response("Order not found", { status: 404 });
  }

  return { order };
}
