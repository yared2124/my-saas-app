"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Check authentication and existing tenant on page load
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("👤 Current user:", user);
      if (!user) {
        alert("You are not logged in. Redirecting to login.");
        router.push("/login");
      } else if (user.app_metadata?.tenant_id) {
        console.log("✅ User has tenant, redirecting to dashboard.");
        // Use full page reload to ensure cookies are fresh
        window.location.href = "/dashboard";
      }
    };
    checkAuth();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Not authenticated. Please log in.");
      }

      if (user.app_metadata?.tenant_id) {
        window.location.href = "/dashboard";
        return;
      }

      console.log("Creating tenant for user:", user.id);

      // 1. Create tenant
      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .insert({ name, slug: name.toLowerCase().replace(/\s/g, "-") })
        .select()
        .single();

      if (tenantError) throw tenantError;
      console.log("✅ Tenant created:", tenant.id);

      // 2. Add user as owner
      const { error: memberError } = await supabase
        .from("tenant_members")
        .insert({
          tenant_id: tenant.id,
          user_id: user.id,
          role: "owner",
        });

      if (memberError) throw memberError;
      console.log("✅ Member added");

      // 3. Update metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { tenant_id: tenant.id },
      });

      if (updateError) throw updateError;
      console.log("✅ Metadata updated");

      // 4. Refresh session
      await supabase.auth.refreshSession();
      console.log("✅ Session refreshed");

      // 5. Full page reload to dashboard
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      let errorMessage = "Something went wrong";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === "object" && "message" in err) {
        errorMessage = String(err.message);
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      console.error("❌ Onboarding error:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded">
      <h1 className="text-2xl font-bold mb-4">Create Your Workspace</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Workspace name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full p-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {isLoading ? "Creating..." : "Create Workspace"}
        </button>
      </form>
    </div>
  );
}
