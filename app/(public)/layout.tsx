export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">{children}</div>
      
      {/* Shared footer for all public pages */}
      <footer className="border-t py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          Powered by{" "}
          <a
            href="https://outcry.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline"
          >
            Outcry
          </a>
        </div>
      </footer>
    </div>
  );
}
