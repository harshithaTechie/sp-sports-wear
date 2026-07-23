import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Home } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/thank-you")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Thank You — SP Sports Wear" },
      { name: "description", content: "Your quotation request has been received. Our team will contact you shortly with the reference number." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ThankYou,
});

function ThankYou() {
  const { id } = Route.useSearch();
  return (
    <div className="min-h-screen bg-hero-gradient text-white flex items-center">
      <div className="container-x py-20 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/10 border border-white/20">
          <CheckCircle2 className="h-10 w-10 text-orange" />
        </div>
        <h1 className="mt-6 font-display text-4xl md:text-6xl font-bold text-balance">
          Thank you! Your request has been received.
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-white/80">
          Your request has been received. We are preparing a quotation and will contact you soon using the details provided.
        </p>
        {id && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm">
            <span className="text-white/60">Your quotation reference number:</span>
            <span className="font-semibold text-orange">{id}</span>
          </div>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">
            <Home className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
