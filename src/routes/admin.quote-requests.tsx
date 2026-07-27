import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { updateQuotationStatus } from "@/lib/orders.functions";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export const Route = createFileRoute("/admin/quote-requests")({
  component: QuoteRequestsPage,
});

type QuoteRow = {
  id: string;
  quotation_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  organization: string | null;
  product_type: string | null;
  fabric: string | null;
  quantity: number | null;
  total_amount: number | null;
  status: string | null;
  notes: string | null;
  logo_url: string | null;
  created_at: string | null;

  design_id: string | null;
design: {
  id: string;
  name: string;
  image_url: string | null;
} | null;
};

function QuoteRequestsPage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRow | null>(null);

  const statuses = [
    "pending",
    "quoted",
    "approved",
    "rejected",
    "in_progress",
  ];

  useEffect(() => {
    loadQuotes();
  }, []);

  function formatDate(value: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleString();
  }

  function getCustomerNotes(notes: string | null) {
    if (!notes) return "—";

    const marker = "Additional Notes:";
    const index = notes.indexOf(marker);

    if (index >= 0) {
      const extracted = notes.slice(index + marker.length).trim();
      return extracted || "—";
    }

    return notes.trim() || "—";
  }

  async function loadQuotes() {
    setLoading(true);

    const { data, error } = await supabase
      .from("quotations")
      .select(`
              id,
              quotation_id,
              customer_name,
              customer_phone,
              customer_email,
              organization,
              product_type,
              fabric,
              quantity,
              total_amount,
              notes,
              logo_url,
              status,
              created_at,
              design_id,
             design:products!design_id (
    id,
    name,
    image_url
  )
`)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
    } else {
      setQuotes((data ?? []) as QuoteRow[]);
    }

    setLoading(false);
  }

  async function updateStatus(
    quoteId: string,
    status: string
  ) {
    setUpdatingId(quoteId);

    try {
      const result = await updateQuotationStatus({
        data: {
          quoteId,
          status,
        },
      });

      if (status === "approved") {
        if (result?.orderCreated) {
          toast.success(
            `Order ${result.orderId} created successfully`
          );
        } else {
          toast.success("Quote approved");
        }
      } else {
        toast.success("Status updated");
      }

      await loadQuotes();

      window.dispatchEvent(new Event("orders-refresh"));
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to update status"
      );
    } finally {
      setUpdatingId(null);
    }
  }  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Quote Requests
          </h1>

          <p className="text-muted-foreground mt-1">
            Review customer quote requests and update their status.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        {loading ? (
          <div className="p-8 text-center">
            Loading quote requests...
          </div>
        ) : quotes.length === 0 ? (
          <div className="p-8 text-center">
            No quote requests found.
          </div>
        ) : (
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left">Quote</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Qty</th>
                <th className="px-4 py-3 text-left">Logo</th>
                <th className="px-4 py-3 text-left">Notes</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {quotes.map((quote) => (
                <tr
                  key={quote.id}
                  className="border-t"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {quote.quotation_id}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {formatDate(quote.created_at)}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {quote.customer_name}
                    </div>

                    <div className="text-xs">
                      {quote.customer_phone}
                    </div>

                    {quote.customer_email && (
                      <div className="text-xs text-muted-foreground">
                        {quote.customer_email}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div>{quote.product_type ?? "—"}</div>

                    <div className="text-xs text-muted-foreground">
                      {quote.fabric ?? "—"}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {quote.quantity ?? "—"}
                  </td>

                  <td className="px-4 py-3">
                    {quote.logo_url ? (
                      <img
                        src={quote.logo_url}
                        alt="Logo"
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No Logo
                      </span>
                    )}
                  </td>

                  <td className="max-w-xs whitespace-pre-wrap break-words px-4 py-3 text-xs">
                    {getCustomerNotes(quote.notes)}
                  </td>

                  <td className="px-4 py-3">
                    <Select
                      value={quote.status ?? "pending"}
                      disabled={updatingId === quote.id}
                      onValueChange={(value) =>
                        updateStatus(quote.id, value)
                      }
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>

                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                          >
                            {status.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>

                  
<td className="px-4 py-3">
<Dialog
  open={selectedQuote?.id === quote.id}
  onOpenChange={(open) =>
    setSelectedQuote(open ? quote : null)
  }
>
  <DialogTrigger asChild>
    <Button variant="outline" size="sm">
      <Eye className="mr-2 h-4 w-4" />
      View
    </Button>
  </DialogTrigger>

  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>
        Quote Details
      </DialogTitle>

      <DialogDescription>
        Complete customer quotation request.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 text-sm">

      <div>
        <strong>Quotation ID:</strong>
        <div>{quote.quotation_id}</div>
      </div>

      <div>
        <strong>Customer</strong>
        <div>{quote.customer_name}</div>
        <div>{quote.customer_phone}</div>
        {quote.customer_whatsapp && (
          <div>WhatsApp: {quote.customer_whatsapp}</div>
        )}
        {quote.customer_email && (
          <div>{quote.customer_email}</div>
        )}
      </div>

      <div>
        <strong>Organization</strong>
        <div>{quote.organization ?? "—"}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <strong>Product</strong>
          <div>{quote.product_type ?? "—"}</div>
        </div>
        {quote.design && (
  <div>
    <strong>Selected Design</strong>

    <div className="mt-2 flex items-center gap-4">
      <img
        src={quote.design.image_url ?? ""}
        alt={quote.design.name}
        className="h-24 w-24 rounded border object-cover"
      />

      <div>
        <p className="font-medium">{quote.design.name}</p>
      </div>
    </div>
  </div>
)}

        <div>
          <strong>Quantity</strong>
          <div>{quote.quantity ?? "—"}</div>
        </div>

        <div>
          <strong>Status</strong>
          <div>{quote.status ?? "pending"}</div>
        </div>

        {quote.fabric && (
          <div>
            <strong>Fabric</strong>
            <div>{quote.fabric}</div>
          </div>
        )}
      </div>

      {quote.logo_url && (
        <div>
          <strong>Logo / Artwork</strong>
          <div className="mt-2">
            <img src={quote.logo_url} alt="Logo" className="h-20 w-20 object-contain rounded border border-border bg-muted p-2" />
          </div>
        </div>
      )}

      <div>
        <strong>Quotation Details</strong>
        <div className="rounded border p-3 whitespace-pre-wrap text-xs">
          {quote.notes ?? "—"}
        </div>
      </div>

    </div>

    <DialogFooter>
      <DialogClose asChild>
        <Button variant="secondary">
          Close
        </Button>
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
