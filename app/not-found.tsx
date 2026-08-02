import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-muted-foreground">Page not found</p>
      <Link
        href="/"
        className="text-primary underline-offset-4 hover:underline"
      >
        Go back home
      </Link>
    </div>
  );
}
