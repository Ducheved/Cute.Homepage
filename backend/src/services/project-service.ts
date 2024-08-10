import { db } from "../db/db";
import { projects, Project, NewProject } from "../db/schema";
import { eq } from "drizzle-orm";
import { bigIntSerializer } from "../utils/json-helpers";

export class ProjectService {
  async createProject(projectData: NewProject): Promise<void> {
    await db.insert(projects).values({
      ...projectData,
      telegramId: BigInt(projectData.telegramId),
    });
  }

  async editProject(
    id: number,
    projectData: Partial<NewProject>,
  ): Promise<void> {
    if (projectData.telegramId) {
      projectData.telegramId = BigInt(projectData.telegramId);
    }
    await db.update(projects).set(projectData).where(eq(projects.id, id));
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async getProjects(): Promise<Project[]> {
    return db.select().from(projects);
  }

  async getProjectById(id: number): Promise<Project | undefined> {
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);
    return result[0];
  }
}
