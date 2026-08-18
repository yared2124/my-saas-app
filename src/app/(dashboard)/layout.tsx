import { TenantProvider } from "@/lib/tenant/context";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("🔍 Dashboard layout - user:", user);
  console.log(
    "🔍 Dashboard layout - tenant_id:",
    user?.app_metadata?.tenant_id,
  );

  if (!user) {
    console.log("❌ No user, redirect to login");
    redirect("/login");
  }
  if (!user.app_metadata?.tenant_id) {
    console.log("❌ No tenant_id, redirect to onboarding");
    redirect("/onboarding");
  }

  console.log("✅ Tenant found, rendering dashboard");
  return (
    <TenantProvider>
      <div className="flex min-h-screen">
        <aside className="w-64 bg-gray-100 p-4 border-r">
          <h2 className="font-bold text-lg">My SaaS</h2>
          <nav className="mt-4 space-y-2">
            <a href="/dashboard" className="block text-blue-600 font-medium">
              Dashboard
            </a>
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </TenantProvider>
  );
}
