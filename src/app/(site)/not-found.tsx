import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-brand flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-heading text-8xl text-primary">404</p>
      <h1 className="mt-4 text-3xl">Page not found</h1>
      <p className="mt-3 max-w-md text-muted-foreground">The page you’re looking for doesn’t exist or has been moved.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn btn-primary">Back to home</Link>
        <Link href="/search" className="btn btn-outline">Search</Link>
      </div>
    </section>
  );
}
