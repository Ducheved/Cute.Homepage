import { Scenes } from "telegraf";
import { MyContext } from "../types";
import { ProjectService } from "../../services/project-service";
import { uploadMediaToS3 } from "../../services/media-service";
import { bot } from "../telegram-bot";
import { KeyboardService } from "../../services/keyboard-service";
import { NewProject } from "../../db/schema";

const projectService = new ProjectService();

interface WizardState {
  projectData?: Partial<NewProject>;
  fileId?: string;
}

const handleTextMessage = async (
  ctx: MyContext,
  field: keyof NewProject,
  nextMessage: string,
  skipKeyboard = false,
) => {
  if (ctx.message && "text" in ctx.message) {
    const state = ctx.wizard.state as WizardState;
    if (!state.projectData) {
      state.projectData = {};
    }
    if (ctx.message.text !== "Пропустить") {
      state.projectData[field] = ctx.message.text as any;
    }
    await ctx.reply(
      nextMessage,
      skipKeyboard ? KeyboardService.getSkipKeyboard() : undefined,
    );
    return ctx.wizard.next();
  }
  await ctx.reply("Пожалуйста, отправьте текстовое сообщение.");
};

const handleImageMessage = async (ctx: MyContext) => {
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
      if (projectData) {
        projectData.telegramId = BigInt(ctx.message.message_id);
        await projectService.createProject(projectData as NewProject);
        await ctx.reply(
          "Проект успешно создан!",
          KeyboardService.getMainMenu(),
        );
      }
      return ctx.scene.leave();
    } else {
      await ctx.reply(
        "Пожалуйста, отправьте изображение или нажмите 'Пропустить'.",
        KeyboardService.getSkipKeyboard(),
      );
      return;
    }
  } catch (error) {
    console.error("Error in project creation process:", error);
    await ctx.reply(
      "Произошла ошибка при создании проекта. Пожалуйста, попробуйте еще раз.",
      KeyboardService.getMainMenu(),
    );
    return ctx.scene.leave();
  }
};

const finalizeProjectCreation = async (ctx: MyContext) => {
  const { projectData, fileId } = ctx.wizard.state as WizardState;
  if (!fileId) {
    await ctx.reply(
      "Ошибка: файл изображения не найден.",
      KeyboardService.getMainMenu(),
    );
    return ctx.scene.leave();
  }

  if (ctx.message && "text" in ctx.message) {
    const applyWatermarkFlag = ctx.message.text.toLowerCase() === "да";
    try {
      const mediaUrl = await uploadMediaToS3(
        fileId,
        bot.getBotInstance(),
        applyWatermarkFlag,
      );
      if (projectData) {
        projectData.imageUrl = mediaUrl;
        projectData.telegramId = BigInt(ctx.message.message_id);
        await projectService.createProject(projectData as NewProject);
        await ctx.reply(
          "Проект успешно создан!",
          KeyboardService.getMainMenu(),
        );
      }
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
};

export const interactiveCreateProjectScene = new Scenes.WizardScene<MyContext>(
  "INTERACTIVE_CREATE_PROJECT",
  async (ctx) => {
    (ctx.wizard.state as WizardState).projectData = {};
    await ctx.reply(
      "Введите заголовок проекта:",
      KeyboardService.getMainMenu(),
    );
    return ctx.wizard.next();
  },
  async (ctx) => handleTextMessage(ctx, "title", "Введите описание проекта:"),
  async (ctx) =>
    handleTextMessage(ctx, "description", "Введите полное описание проекта:"),
  async (ctx) =>
    handleTextMessage(
      ctx,
      "fullDescription",
      "Введите URL изображения проекта (или нажмите 'Пропустить'):",
      true,
    ),
  async (ctx) =>
    handleTextMessage(ctx, "imageUrl", "Введите теги проекта (через запятую):"),
  async (ctx) => handleTextMessage(ctx, "tags", "Введите ссылку на проект:"),
  async (ctx) =>
    handleTextMessage(
      ctx,
      "link",
      "Введите стэк технологий проекта (через запятую):",
    ),
  async (ctx) => handleTextMessage(ctx, "stack", "Введите контент проекта:"),
  async (ctx) =>
    handleTextMessage(
      ctx,
      "content",
      "Отправьте изображение для проекта или нажмите 'Пропустить'.",
      true,
    ),
  async (ctx) => {
    const { projectData } = ctx.wizard.state as WizardState;
    if (projectData && projectData.imageUrl) {
      await finalizeProjectCreation(ctx);
    } else {
      await handleImageMessage(ctx);
    }
  },
  async (ctx) => finalizeProjectCreation(ctx),
);
