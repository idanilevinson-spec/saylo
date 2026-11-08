// The sign-in pages (login, signup, password reset): the form as a sheet of
// paper on the page, nothing behind it.
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return <div>{children}</div>;
}
