"use client";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <section className="container-brand flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <h1 className="text-3xl">Something went wrong</h1>
      <p className="mt-3 max-w-md text-muted-foreground">An unexpected error occurred. Please try again.</p>
      {process.env.NODE_ENV !== "production" && <pre className="mt-6 max-w-2xl overflow-auto rounded bg-muted p-4 text-left text-xs whitespace-pre-wrap">{error.message}</pre>}
      <button onClick={reset} className="btn btn-primary mt-8">Try again</button>
    </section>
  );
}
