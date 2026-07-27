import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";

type OrderRow = {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  customer_whatsapp: string | null;
  organization: string | null;
  notes: string | null;
  logo_url: string | null;
  status: string | null;
  total_amount: number | null;
  created_at: string | null;
  updated_at: string | null;
  delivery_address: string | null;
  quotation_id: string | null;
};

type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  size_breakup: Record<string, number> | null;
  customization: {
    color?: string;
    collar?: string;
    sleeve?: string;
    fabric?: string;
    players?: string;
    sponsor?: string;
  } | null;
};

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

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
      .select(`
        id,
        order_id,
        customer_name,
        customer_email,
        customer_phone,
        customer_whatsapp,
        organization,
        notes,
        logo_url,
        status,
        total_amount,
        delivery_address,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error('Supabase error loading orders:', error);
      toast.error(`Failed to load orders: ${error.message}`);
    } else {
      console.log('Loaded orders:', data);
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

  async function loadOrderItems(orderId: string) {
    setLoadingItems(true);
    const { data, error } = await supabase
      .from("order_items")
      .select("id, product_name, quantity, size_breakup, customization")
      .eq("order_id", orderId);

    if (error) {
      console.error('Supabase error loading order items:', error);
      toast.error(`Failed to load order items: ${error.message}`);
    } else {
      console.log('Loaded order items:', data);
      setOrderItems((data ?? []) as OrderItem[]);
    }
    setLoadingItems(false);
  }

  async function handleViewOrder(order: OrderRow) {
    setSelectedOrder(order);
    await loadOrderItems(order.id);
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
          <table className="min-w-[700px] w-full text-sm">
            <thead className="bg-muted/70 text-left">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">View</th>
              </tr>
            </thead>
           <tbody>
  {orders.map((order) => (
    <tr key={order.id} className="border-t border-border">
      <td className="px-4 py-3">
        <div className="font-medium">{order.order_id}</div>
        <div className="text-xs text-muted-foreground">
          {order.created_at
            ? new Date(order.created_at).toLocaleDateString()
            : "—"}
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="font-medium">{order.customer_name}</div>
        <div className="text-xs text-muted-foreground">
          {order.customer_email ?? order.customer_phone}
        </div>
      </td>

      <td className="px-4 py-3">
        {order.organization ?? "—"}
      </td>

      <td className="px-4 py-3">
        {order.total_amount ? `₹${order.total_amount}` : "—"}
      </td>

      <td className="px-4 py-3">
        <div className="max-w-full sm:max-w-[180px]">
          <Select
            value={order.status ?? statuses[0]}
            onValueChange={(value) => updateStatus(order.id, value)}
            disabled={updatingId === order.id}
          >
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

      <td className="px-4 py-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder?.order_id}</DialogTitle>
              <DialogDescription>Full order information and items</DialogDescription>
            </DialogHeader>
            <OrderDetailView order={selectedOrder} orderItems={orderItems} loadingItems={loadingItems} />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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

function OrderDetailView({ order, orderItems, loadingItems }: { order: OrderRow | null; orderItems: OrderItem[]; loadingItems: boolean }) {
  if (!order) return <div className="text-sm text-muted-foreground">No order selected</div>;

  return (
    <div className="space-y-6">
      {/* Customer Details */}
      <div className="space-y-3">
        <h3 className="font-semibold text-primary">Customer Information</h3>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span className="font-medium">{order.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span>{order.customer_email || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phone:</span>
            <span>{order.customer_phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">WhatsApp:</span>
            <span>{order.customer_whatsapp || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Organization:</span>
            <span>{order.organization || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Address:</span>
            <span className="max-w-[60%] text-right">{order.delivery_address || "—"}</span>
          </div>
        </div>
      </div>

      {/* Logo */}
      {order.logo_url && (
        <div className="space-y-3">
          <h3 className="font-semibold text-primary">Logo / Artwork</h3>
          <img src={order.logo_url} alt="Order logo" className="h-24 w-24 object-contain rounded border border-border bg-muted p-2" />
        </div>
      )}

      {/* Notes */}
      {order.notes && (
        <div className="space-y-3">
          <h3 className="font-semibold text-primary">Notes</h3>
          <div className="rounded-md bg-muted p-3 text-sm whitespace-pre-wrap">{order.notes}</div>
        </div>
      )}

      {/* Order Items */}
      <div className="space-y-3">
        <h3 className="font-semibold text-primary">Order Items</h3>
        {loadingItems ? (
          <div className="text-sm text-muted-foreground">Loading items...</div>
        ) : orderItems.length === 0 ? (
          <div className="text-sm text-muted-foreground">No items found</div>
        ) : (
          <div className="space-y-4">
            {orderItems.map((item) => (
              <div key={item.id} className="rounded-md border border-border p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{item.product_name}</div>
                    <div className="text-sm text-muted-foreground">Quantity: {item.quantity}</div>
                  </div>
                </div>

                {/* Size Breakup */}
                {item.size_breakup && Object.keys(item.size_breakup).length > 0 && (
                  <div className="text-sm">
                    <div className="font-medium text-muted-foreground mb-1">Size Breakup:</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(item.size_breakup).map(([size, qty]) => (
                        qty > 0 && (
                          <span key={size} className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs">
                            {size}: {qty}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Customization Details */}
                {item.customization && Object.keys(item.customization).length > 0 && (
                  <div className="text-sm">
                    <div className="font-medium text-muted-foreground mb-1">Customization:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {item.customization.color && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Color:</span>
                          <span>{item.customization.color}</span>
                        </div>
                      )}
                      {item.customization.collar && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Collar:</span>
                          <span>{item.customization.collar}</span>
                        </div>
                      )}
                      {item.customization.sleeve && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sleeve:</span>
                          <span>{item.customization.sleeve}</span>
                        </div>
                      )}
                      {item.customization.fabric && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fabric:</span>
                          <span>{item.customization.fabric}</span>
                        </div>
                      )}
                      {item.customization.players && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Players: </span>
                          <span>{item.customization.players}</span>
                        </div>
                      )}
                      {item.customization.sponsor && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Sponsors: </span>
                          <span>{item.customization.sponsor}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Metadata */}
      <div className="space-y-3 pt-4 border-t border-border">
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Amount:</span>
            <span className="font-medium">{order.total_amount ? `₹${order.total_amount}` : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order Date:</span>
            <span>{order.created_at ? new Date(order.created_at).toLocaleString() : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated:</span>
            <span>{order.updated_at ? new Date(order.updated_at).toLocaleString() : "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
