export default function ReportsPageShell({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="reports-root"
      className="
        w-full max-w-none
        px-3 md:px-4 xl:px-6
        pt-safe
        space-y-5
      "
    >
      {children}
    </main>
  );
}
