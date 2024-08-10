import { Scenes } from "telegraf";
import { MyContext } from "../types";
import { ProjectService } from "../../services/project-service";
import { KeyboardService } from "../../services/keyboard-service";

const projectService = new ProjectService();

export const deleteProjectScene = new Scenes.WizardScene<MyContext>(
  "DELETE_PROJECT",
  async (ctx) => {
    const projects = await projectService.getProjects();
    await ctx.reply(
      "Выберите проект для удаления:",
      KeyboardService.getProjectListKeyboard(projects),
    );
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
      await projectService.deleteProject(projects[index].id);
      await ctx.reply("Проект успешно удален!", KeyboardService.getMainMenu());
      return ctx.scene.leave();
    }
    await ctx.reply("Пожалуйста, отправьте текстовое сообщение.");
  },
);
