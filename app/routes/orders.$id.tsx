import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getOrderDetail } from "~/action/order";
import MainLayout from "~/layouts/MainLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";


export default function OrderDetailPage() {
  const { order } = useLoaderData<typeof loader>();
  const slipUrl = order.paymentSlip

  return (
    <MainLayout>
      <Card>
        <CardHeader>
          <CardTitle>Order #{order.id}</CardTitle>
          <CardDescription>Status: {order.status}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p>
              Total: {order.currency} {Number(order.totalAmount).toFixed(2)}
            </p>
            <p>
              Payment:{" "}
              {order.paymentStatus === "successful" ? (
                <Badge className="bg-green-50 text-green-700 border-green-200" variant="outline">
                  Verified
                </Badge>
              ) : (
                <Badge className="bg-red-50 text-red-700 border-red-200" variant="outline">
                  Pending
                </Badge>
              )}
            </p>
          </div>

          {slipUrl && (
            <div className="space-y-2">
              <p className="font-semibold">Payment Slip</p>
              <img
                src={slipUrl}
                alt="Payment Slip"
                className="max-w-xs rounded-md border"
              />
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <h2 className="font-semibold">Items</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {order.currency} {item.price.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

export async function loader({ params }: LoaderFunctionArgs) {
  const id = Number.parseInt(params.id || "");
  if (Number.isNaN(id)) {
    throw new Response("Invalid order ID", { status: 400 });
  }
  const order = await getOrderDetail(id);
  if (!order) {
    throw new Response("Order not found", { status: 404 });
  }
  return { order };
}