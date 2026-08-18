"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type TenantContextType = {
  tenantId: string | null;
  setTenantId: (id: string) => void;
  isLoading: boolean;
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const loadTenant = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.app_metadata?.tenant_id) {
        setTenantId(user.app_metadata.tenant_id);
      } else {
        // If no tenant, redirect to onboarding
        router.push("/onboarding");
      }
      setIsLoading(false);
    };
    loadTenant();
  }, [supabase, router]);

  return (
    <TenantContext.Provider value={{ tenantId, setTenantId, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context)
    throw new Error("useTenant must be used within a TenantProvider");
  return context;
};
