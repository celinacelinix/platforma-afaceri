export default function DashboardLayout({ children }: LayoutProps<'/dashboard'>) {
  // The sidebar and KPI bar are rendered inside the page itself (client component)
  // because they need live engine state. This layout is a transparent pass-through.
  return <>{children}</>;
}
