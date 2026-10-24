// The sign-in pages (login, signup, password reset) stand on the same lit
// horizon as the home page, the hubs and pricing, so the walk from "start
// learning for free" to the form reads as one place. The form sits in
// front of the planet's rim; the planet's body is the page background, so
// the band ends without a seam.
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative isolate overflow-hidden bg-background-2 [--horizon-top:calc(100%-12rem)] [--horizon-width:110rem]">
      <span aria-hidden="true" className="horizon" />
      {children}
    </div>
  );
}
