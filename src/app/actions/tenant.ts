"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTenant(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const name = formData.get("name") as string;
  const slug = name.toLowerCase().replace(/\s/g, "-");

  // 1. Insert tenant
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({ name, slug })
    .select()
    .single();
  if (tenantError) throw tenantError;

  // 2. Add user as owner
  const { error: memberError } = await supabase
    .from("tenant_members")
    .insert({ tenant_id: tenant.id, user_id: user.id, role: "owner" });
  if (memberError) throw memberError;

  // 3. Update user metadata
  const { error: updateError } = await supabase.auth.updateUser({
    data: { tenant_id: tenant.id },
  });
  if (updateError) throw updateError;

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
