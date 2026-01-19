export function UploadRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        w-full max-w-none                /* ← stretch */
        grid gap-4 md:gap-5
        grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
      "
    >
      {children}
    </div>
  );
}
