import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient(); // ✅ MUST have await
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Your Projects</h1>
      <ul>
        {projects?.map((project) => (
          <li key={project.id}>{project.name}</li>
        ))}
      </ul>
    </div>
  );
}
