// Re-mounts on every navigation, so each page arrives with a short fade-rise
// and a flame line that sweeps across the top of the screen. Pure CSS
// (.page-enter / .route-sweep in globals.css); off for reduced motion.
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span aria-hidden="true" className="route-sweep" />
      <div className="page-enter">{children}</div>
    </>
  );
}
