import { useLoaderData, useSubmit } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import {
  getOrderDetail,
  verifyPayment,
  updateOrderStatus,
  updatePaymentStatus,
  ORDER_STATUSES,
} from "~/action/order";
import { HTTP_STATUS } from "~/config/http";
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
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";


export default function OrderDetailPage() {
  const { order } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const slipUrl = order.paymentSlip;

  function handleVerify() {
    const formData = new FormData();
    formData.append("intent", "verify-payment");
    submit(formData, { method: "POST" });
  }

  function handleStatusChange(value: string) {
    const formData = new FormData();
    formData.append("intent", "update-status");
    formData.append("status", value);
    submit(formData, { method: "PUT" });
  }

  function handlePaymentStatusChange(value: string) {
    const formData = new FormData();
    formData.append("intent", "update-payment");
    formData.append("status", value);
    submit(formData, { method: "PUT" });
  }

  return (
    <MainLayout>
      <Card>
        <CardHeader>
          <CardTitle>Order #{order.id}</CardTitle>
          <div className="mt-2 flex items-center gap-2">
            <CardDescription>Status:</CardDescription>
            <Select defaultValue={order.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p>
              Total: {order.currency} {Number(order.totalAmount).toFixed(2)}
            </p>
            <p className="flex items-center gap-2">
              <span>Payment:</span>
              {order.paymentStatus === "successful" ? (
                <Badge className="bg-green-50 text-green-700 border-green-200" variant="outline">
                  Verified
                </Badge>
              ) : (
                <Badge className="bg-red-50 text-red-700 border-red-200" variant="outline">
                  Pending
                </Badge>
              )}
              {order.status === "pending" && order.paymentStatus !== "successful" && (
                <Button variant="outline" size="sm" onClick={handleVerify}>
                  Verify
                </Button>
              )}
            </p>
            {order.status !== "pending" && order.status !== "processing" && (
              <div className="mt-2">
                <Select
                  defaultValue={order.paymentStatus}
                  onValueChange={handlePaymentStatusChange}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">pending</SelectItem>
                    <SelectItem value="refunded">refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
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

export async function action({ request, params }: ActionFunctionArgs) {
  const orderId = Number.parseInt(params.id || "");
  if (Number.isNaN(orderId)) {
    throw new Response("Invalid order ID", { status: 400 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "verify-payment") {
    await verifyPayment(orderId);
    return { status: HTTP_STATUS.OK };
  }

  if (intent === "update-status") {
    const status = formData.get("status")?.toString();
    if (!status) {
      throw new Response("Status required", { status: HTTP_STATUS.BAD_REQUEST });
    }
    await updateOrderStatus(orderId, status as (typeof ORDER_STATUSES)[number]);
    return { status: HTTP_STATUS.OK };
  }

  if (intent === "update-payment") {
    const status = formData.get("status")?.toString();
    if (!status) {
      throw new Response("Status required", { status: HTTP_STATUS.BAD_REQUEST });
    }
    await updatePaymentStatus(orderId, status as any);
    return { status: HTTP_STATUS.OK };
  }

  return new Response("Bad Request", { status: HTTP_STATUS.BAD_REQUEST });
}