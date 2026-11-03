import { Info } from "lucide-react";

/** Honest disclosure shown while orders are stored by the non-durable demo repository. */
export function DemoNotice({ provider, durable }: { provider: string; durable: boolean }) {
  if (durable && provider === "manual") return null;
  return (
    <p className="flex items-start gap-2 rounded-brand border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
      <Info className="mt-0.5 size-4 shrink-0 text-amber-600" />
      <span>
        <strong>Demo store:</strong> {durable ? "orders are saved, but " : "orders are validated and priced on the server but are not saved to a database, and "}no real card payment is taken
        {provider !== "manual" ? ` until ${provider} API keys are configured` : ""}. See docs/INTEGRATIONS.md.
      </span>
    </p>
  );
}
