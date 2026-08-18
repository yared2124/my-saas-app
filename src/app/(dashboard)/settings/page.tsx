import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch current tenant info (optional)
  const { data: tenant } = await supabase
    .from("tenants")
    .select("name, slug")
    .eq("id", user.app_metadata?.tenant_id)
    .single();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p>Workspace: {tenant?.name}</p>
      {/* Add more settings controls */}
    </div>
  );
}
