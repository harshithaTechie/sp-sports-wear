import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type OrderRow = {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  organization: string | null;
  status: string | null;
  total_amount: number | null;
  created_at: string | null;
  updated_at: string | null;
};

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
    const handleOrdersRefresh = () => {
      loadOrders();
    };
    window.addEventListener("orders-refresh", handleOrdersRefresh);
    return () => window.removeEventListener("orders-refresh", handleOrdersRefresh);
  }, []);

  async function loadOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("id, order_id, customer_name, customer_email, customer_phone, organization, status, total_amount, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
    } else {
      setOrders((data ?? []) as OrderRow[]);
    }
    setLoading(false);
  }

  async function updateStatus(orderId: string, value: string) {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase.from("orders").update({ status: value }).eq("id", orderId);
      if (error) throw error;

      // Add corresponding status event so customer tracking timeline is updated
      await supabase.from("order_status_events").insert({
        order_id: orderId,
        status: value,
        notes: `Order status changed to ${value.replace(/_/g, " ")}`,
      });

      toast.success("Order status updated");
      await loadOrders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  }


  const statuses = ["quotation_received", "confirmed", "in_production", "ready_to_ship", "shipped", "delivered", "cancelled"];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review incoming orders and update their progress.</p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No orders yet.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-muted/70 text-left">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="font-medium">{order.order_id}</div>
                    <div className="text-xs text-muted-foreground">{order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{order.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{order.customer_email ?? order.customer_phone}</div>
                  </td>
                  <td className="px-4 py-3">{order.organization ?? "—"}</td>
                  <td className="px-4 py-3">{order.total_amount ? `₹${order.total_amount}` : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="max-w-full sm:max-w-[180px]">
                      <Select value={order.status ?? statuses[0]} onValueChange={(value) => updateStatus(order.id, value)} disabled={updatingId === order.id}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
