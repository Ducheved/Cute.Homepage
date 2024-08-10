import { Scenes } from "telegraf";
import { MyContext } from "../types";
import { ProjectService } from "../../services/project-service";
import { parseProjectDetails } from "../../utils/project-parser";
import { uploadMediaToS3 } from "../../services/media-service";
import { bot } from "../telegram-bot";
import { KeyboardService } from "../../services/keyboard-service";
import { NewProject } from "../../db/schema";

const projectService = new ProjectService();

interface WizardState {
  projectData?: Partial<NewProject>;
  fileId?: string;
}

export const createProjectScene = new Scenes.WizardScene<MyContext>(
  "CREATE_PROJECT",
  async (ctx) => {
    await ctx.reply(
      "Введите детали проекта в формате:\n#заголовок:Title\n#описание:Description\n#полноеОписание:Full Description\n#изображение:ImageURL (необязательно)\n#теги:tag1,tag2,tag3\n#ссылка:ProjectLink\n#стэк:tech1,tech2,tech3\n#контент:Content",
      KeyboardService.getMainMenu(),
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (ctx.message && "text" in ctx.message) {
      const projectData = parseProjectDetails(ctx.message.text);
      projectData.telegramId = BigInt(ctx.message.message_id);
      if (Object.keys(projectData).length === 0) {
        await ctx.reply(
          "Неверный формат. Попробуйте еще раз.",
          KeyboardService.getMainMenu(),
        );
        return;
      }
      (ctx.wizard.state as WizardState).projectData = projectData;
      if (projectData.imageUrl) {
        await projectService.createProject(projectData as NewProject);
        await ctx.reply(
          "Проект успешно создан!",
          KeyboardService.getMainMenu(),
        );
        return ctx.scene.leave();
      } else {
        await ctx.reply(
          "Отправьте изображение для проекта или нажмите 'Пропустить'.",
          KeyboardService.getSkipKeyboard(),
        );
        return ctx.wizard.next();
      }
    }
    await ctx.reply(
      "Пожалуйста, отправьте текстовое сообщение.",
      KeyboardService.getMainMenu(),
    );
  },
  async (ctx) => {
    const { projectData } = ctx.wizard.state as WizardState;
    if (!projectData) {
      await ctx.reply(
        "Ошибка: данные проекта не найдены.",
        KeyboardService.getMainMenu(),
      );
      return ctx.scene.leave();
    }

    try {
      if (ctx.message && "photo" in ctx.message) {
        const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        await ctx.reply(
          "Хотите добавить водяной знак на изображение? Отправьте 'да' или 'нет'.",
          KeyboardService.getYesNoKeyboard(),
        );
        (ctx.wizard.state as WizardState).fileId = fileId;
        return ctx.wizard.next();
      } else if (
        ctx.message &&
        "text" in ctx.message &&
        ctx.message.text === "Пропустить"
      ) {
      } else {
        await ctx.reply(
          "Пожалуйста, отправьте изображение или нажмите 'Пропустить'.",
          KeyboardService.getSkipKeyboard(),
        );
        return;
      }

      await projectService.createProject(projectData as NewProject);
      await ctx.reply("Проект успешно создан!", KeyboardService.getMainMenu());
    } catch (error) {
      console.error("Error in project creation process:", error);
      await ctx.reply(
        "Произошла ошибка при создании проекта. Пожалуйста, попробуйте еще раз.",
        KeyboardService.getMainMenu(),
      );
    }

    return ctx.scene.leave();
  },
  async (ctx) => {
    const { projectData, fileId } = ctx.wizard.state as WizardState;
    if (ctx.message && "text" in ctx.message) {
      const applyWatermarkFlag = ctx.message.text.toLowerCase() === "да";
      try {
        const mediaUrl = await uploadMediaToS3(
          fileId!,
          bot.getBotInstance(),
          applyWatermarkFlag,
        );
        projectData!.imageUrl = mediaUrl;

        await projectService.createProject(projectData as NewProject);
        await ctx.reply(
          "Проект успешно создан!",
          KeyboardService.getMainMenu(),
        );
      } catch (error) {
        console.error("Error in project creation process:", error);
        await ctx.reply(
          "Произошла ошибка при создании проекта. Пожалуйста, попробуйте еще раз.",
          KeyboardService.getMainMenu(),
        );
      }
    } else {
      await ctx.reply(
        "Пожалуйста, отправьте 'да' или 'нет'.",
        KeyboardService.getYesNoKeyboard(),
      );
      return;
    }

    return ctx.scene.leave();
  },
);
