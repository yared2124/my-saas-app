"use client";

import { Tables } from "@/types/database";

type Project = Tables<"projects">;

export function ProjectList({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  return (
    <ul className="space-y-2">
      {initialProjects.map((project) => (
        <li key={project.id} className="p-4 border rounded shadow-sm">
          <h3 className="font-semibold">{project.name}</h3>
          {project.description && (
            <p className="text-gray-600">{project.description}</p>
          )}
        </li>
      ))}
      {initialProjects.length === 0 && (
        <p className="text-gray-500">
          No projects yet. Create your first one above!
        </p>
      )}
    </ul>
  );
}
