import { useLoaderData } from "@remix-run/react";
import MainLayout from "~/layouts/MainLayout";
import { getOrders } from "~/action/order";
import { OrdersTable } from "~/components/orders/order-table";

export default function OrdersPage() {
  const { orderList } = useLoaderData<typeof loader>();

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">Manage customer orders</p>
          </div>
        </div>

        <OrdersTable data={orderList} />
      </div>
    </MainLayout>
  );
}

export async function loader() {
  const orderList = await getOrders();
  return { orderList };
}
