import { Dispatch, SetStateAction } from "react";

import env from "../env";
import { ProjectGroup } from "../types";
import { iconMap } from "../utils/iconMap";

export const fetchProjects = async (
  setProjects: Dispatch<SetStateAction<ProjectGroup[]>>,
) => {
  try {
    const response = await fetch(`${env.VITE_API_URL}/api/projects`);
    const data = await response.json();
    const formattedProjects = formatProjects(data);
    setProjects(formattedProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
};

const formatProjects = (projects: ProjectGroup[]): ProjectGroup[] => {
  return projects.map((group) => ({
    ...group,
    months: group.months.map((month) => ({
      ...month,
      items: month.items.map((item) => ({
        ...item,
        stack: item.stack
          .map((tech) => {
            if (typeof tech === "string") {
              return iconMap[tech.toLowerCase()] || null;
            }
            return null;
          })
          .filter(Boolean),
      })),
    })),
  }));
};
