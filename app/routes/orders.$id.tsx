import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getOrderDetail } from "~/action/order";
import MainLayout from "~/layouts/MainLayout";

export default function OrderDetailPage() {
  const { order } = useLoaderData<typeof loader>();

  return (
    <MainLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Order #{order.id}</h1>
        <p>Status: {order.status}</p>
        <p>
          Total: {order.currency} {Number(order.totalAmount).toFixed(2)}
        </p>
        <div>
          <h2 className="font-semibold">Items</h2>
          <ul className="list-disc pl-6">
            {order.items.map((item) => (
              <li key={item.productId}>
                {item.name} x{item.quantity} - {order.currency}{" "}
                {item.price.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      </div>
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