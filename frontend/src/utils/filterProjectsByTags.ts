import { ProjectGroup } from "../types";

export const filterProjectsByTags = (
  projects: ProjectGroup[],
  selectedTags: string[],
): ProjectGroup[] => {
  if (selectedTags.length === 0) return projects;

  return projects.map((group) => ({
    ...group,
    months: group.months.map((month) => ({
      ...month,
      items: month.items.filter((project) =>
        project.tags.some((tag) => selectedTags.includes(tag)),
      ),
    })),
  }));
};
