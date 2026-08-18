-- 1. Tenants
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tenant members
CREATE TABLE public.tenant_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner','admin','member','viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

-- 3. Example resource: projects
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_projects_tenant_id ON public.projects(tenant_id);
CREATE INDEX idx_tenant_members_tenant_id ON public.tenant_members(tenant_id);
CREATE INDEX idx_tenant_members_user_id ON public.tenant_members(user_id);

-- Helper functions
CREATE OR REPLACE FUNCTION auth.current_tenant_id()
RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::UUID;
$$;

CREATE OR REPLACE FUNCTION auth.user_belongs_to_tenant(tenant_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE tenant_id = $1 AND user_id = auth.uid()
  );
$$;

-- Trigger to auto‑set tenant_id on INSERT
CREATE OR REPLACE FUNCTION set_tenant_id_from_jwt()
RETURNS TRIGGER AS $$
BEGIN
    NEW.tenant_id := auth.current_tenant_id();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own tenant" ON public.tenants
    FOR SELECT USING (id = auth.current_tenant_id());

CREATE POLICY "Users can view members of own tenant" ON public.tenant_members
    FOR SELECT USING (tenant_id = auth.current_tenant_id());

CREATE POLICY "Tenant isolation for projects" ON public.projects
    FOR ALL USING (tenant_id = auth.current_tenant_id());

-- Trigger on projects
CREATE TRIGGER enforce_projects_tenant_id
    BEFORE INSERT ON public.projects
    FOR EACH ROW EXECUTE FUNCTION set_tenant_id_from_jwt();