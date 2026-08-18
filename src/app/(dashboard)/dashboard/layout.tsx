import { TenantProvider } from "@/lib/tenant/context";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!user.app_metadata?.tenant_id) redirect("/onboarding");

  return (
    <TenantProvider>
      <div className="flex min-h-screen">
        <aside className="w-64 bg-gray-100 p-4">
          <h2 className="font-bold">My SaaS</h2>
          <nav className="mt-4 space-y-2">
            <a href="/dashboard" className="block">
              Dashboard
            </a>
            <a href="/settings" className="block">
              Settings
            </a>
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </TenantProvider>
  );
}
