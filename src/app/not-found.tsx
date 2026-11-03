import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="text-3xl">Page not found</h1>
      <Link href="/" className="btn btn-primary mt-8">Back to home</Link>
    </section>
  );
}
