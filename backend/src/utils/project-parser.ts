import { NewProject } from "../db/schema";

export function parseProjectDetails(text: string): Partial<NewProject> {
  const lines = text.split("\n");
  const project: Partial<NewProject> = {};
  lines.forEach((line) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim().slice(1);
      const value = line.slice(colonIndex + 1).trim();
      switch (key) {
        case "заголовок":
          project.title = value;
          break;
        case "описание":
          project.description = value;
          break;
        case "полноеОписание":
          project.fullDescription = value;
          break;
        case "изображение":
          project.imageUrl = value;
          break;
        case "теги":
          project.tags = JSON.stringify(
            value.split(",").map((tag) => tag.trim()),
          );
          break;
        case "ссылка":
          project.link = value;
          break;
        case "стэк":
          project.stack = JSON.stringify(
            value.split(",").map((tech) => tech.trim()),
          );
          break;
        case "контент":
          project.content = value;
          break;
      }
    }
  });
  return project;
}
