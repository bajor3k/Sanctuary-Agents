export default function FullBleed({ children }: { children: React.ReactNode }) {
  // Cancels the shell’s horizontal padding (-mx-*) then restores it inside (px-*)
  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8">
      <div className="px-4 md:px-6 lg:px-8">{children}</div>
    </div>
  );
}
