export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex flex-col items-center gap-6 px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Xanban
        </h1>
        <p className="max-w-sm text-muted-foreground">
          Task management. Edit <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-medium">app/page.tsx</code> to get started.
        </p>
      </main>
    </div>
  );
}
