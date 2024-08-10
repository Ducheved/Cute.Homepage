import { Scenes } from "telegraf";
import { MyContext } from "../types";
import { ProjectService } from "../../services/project-service";
import { parseProjectDetails } from "../../utils/project-parser";
import { KeyboardService } from "../../services/keyboard-service";

interface WizardState {
  projectId?: number;
}

const projectService = new ProjectService();

export const editProjectScene = new Scenes.WizardScene<MyContext>(
  "EDIT_PROJECT",
  async (ctx) => {
    const projects = await projectService.getProjects();
    const projectList = projects
      .map((p, i) => `${i + 1}. ${p.title.substring(0, 30)}`)
      .join("\n");
    await ctx.reply(`Выберите проект для редактирования:\n${projectList}`);
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (ctx.message && "text" in ctx.message) {
      const index = parseInt(ctx.message.text) - 1;
      const projects = await projectService.getProjects();
      if (isNaN(index) || index < 0 || index >= projects.length) {
        await ctx.reply("Неверный выбор. Попробуйте еще раз.");
        return;
      }
      (ctx.wizard.state as WizardState).projectId = projects[index].id;
      await ctx.reply("Введите обновленные детали проекта в том же формате.");
      return ctx.wizard.next();
    }
    await ctx.reply("Пожалуйста, отправьте текстовое сообщение.");
  },
  async (ctx) => {
    const { projectId } = ctx.wizard.state as WizardState;
    if (ctx.message && "text" in ctx.message) {
      const projectData = parseProjectDetails(ctx.message.text);
      projectData.telegramId = BigInt(ctx.message.message_id);
      if (Object.keys(projectData).length === 0) {
        await ctx.reply("Неверный формат. Попробуйте еще раз.");
        return;
      }
      if (typeof projectId !== "number") {
        await ctx.reply("ID проекта не найден. Начните сначала.");
        return ctx.scene.leave();
      }
      await projectService.editProject(projectId, projectData);
      await ctx.reply(
        "Проект успешно обновлен!",
        KeyboardService.getMainMenu(),
      );
      return ctx.scene.leave();
    }
    await ctx.reply("Пожалуйста, отправьте текстовое сообщение.");
  },
);
