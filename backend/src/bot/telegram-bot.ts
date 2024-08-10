import { Telegraf, Scenes, session } from "telegraf";
import { Message } from "telegraf/typings/core/types/typegram";
import { MyContext } from "./types";
import { createProjectScene } from "./scenes/create-project-scene";
import { interactiveCreateProjectScene } from "./scenes/interactive-create-project-scene";
import { editProjectScene } from "./scenes/edit-project-scene";
import { deleteProjectScene } from "./scenes/delete-project-scene";
import { ChannelService } from "../services/channel-service";
import { PostService } from "../services/post-service";
import { KeyboardService } from "../services/keyboard-service";
import env from "../config/env";

export class TelegramBot {
  private bot: Telegraf<MyContext>;
  private stage: Scenes.Stage<MyContext>;
  private channelService: ChannelService;
  private postService: PostService;

  constructor(
    token: string,
    channelService: ChannelService,
    postService: PostService,
  ) {
    this.bot = new Telegraf<MyContext>(token);
    this.channelService = channelService;
    this.postService = postService;

    this.stage = new Scenes.Stage<MyContext>([
      createProjectScene,
      interactiveCreateProjectScene,
      editProjectScene,
      deleteProjectScene,
    ]);

    this.setupMiddleware();
    this.setupCommands();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.bot.use(session());
    this.bot.use(this.stage.middleware());
  }

  private setupCommands() {
    this.bot.command("start", this.handleStart);
    this.bot.command("newproject", (ctx) => ctx.scene.enter("CREATE_PROJECT"));
    this.bot.command("editproject", (ctx) => ctx.scene.enter("EDIT_PROJECT"));
    this.bot.command("deleteproject", (ctx) =>
      ctx.scene.enter("DELETE_PROJECT"),
    );
    this.bot.command("channels", this.handleChannels);
    this.bot.command("list_channels", this.handleListChannels);

    this.bot.hears("Создать проект", (ctx) =>
      ctx.scene.enter("CREATE_PROJECT"),
    );
    this.bot.hears("Интерактивное создание проекта", (ctx) =>
      ctx.scene.enter("INTERACTIVE_CREATE_PROJECT"),
    );
    this.bot.hears("Редактировать проект", (ctx) =>
      ctx.scene.enter("EDIT_PROJECT"),
    );
    this.bot.hears("Удалить проект", (ctx) =>
      ctx.scene.enter("DELETE_PROJECT"),
    );
    this.bot.hears("Просмотреть каналы", this.handleChannels);
  }

  private setupEventHandlers() {
    this.bot.on(["message", "channel_post"], this.handleMessage);
    this.bot.on("left_chat_member", this.handleLeftChatMember);
  }

  private handleStart = async (ctx: MyContext) => {
    await ctx.reply(
      "Добро пожаловать! Используйте кнопки ниже для навигации.",
      KeyboardService.getMainMenu(),
    );
  };

  private handleChannels = async (ctx: MyContext) => {
    const channels = await this.channelService.getChannels();
    const channelList = channels
      .map((c) => `- ${c.name} (${c.channelId})`)
      .join("\n");
    await ctx.reply(`Отслеживаемые каналы:\n${channelList}`);
  };

  private handleListChannels = async (ctx: MyContext) => {
    try {
      const channels = await this.channelService.getChannels();
      const channelList = channels
        .map((c) => `- ${c.name} (${c.channelId.toString()})`)
        .join("\n");
      await ctx.reply(`Список отслеживаемых каналов:\n${channelList}`);
    } catch (error) {
      console.error("Error listing channels:", error);
      await ctx.reply("Произошла ошибка при получении списка каналов.");
    }
  };

  private handleMessage = async (ctx: MyContext) => {
    const msg =
      "message" in ctx.update
        ? ctx.update.message
        : (ctx.update as any).channel_post;

    if (!msg) return;

    const chat = msg.chat as Message["chat"];
    const chatId = BigInt(chat.id);
    let chatName = "Unnamed Chat";
    let chatType: "private" | "group" | "supergroup" | "channel";

    switch (chat.type) {
      case "private":
        chatName = `${chat.first_name} ${chat.last_name || ""}`.trim();
        chatType = "private";
        break;
      case "group":
      case "supergroup":
        chatName = chat.title || "Unnamed Group";
        chatType = chat.type;
        break;
      case "channel":
        chatName = chat.title || "Unnamed Channel";
        chatType = "channel";
        break;
      default:
        return;
    }

    try {
      if (chatType !== "private") {
        await this.handleNonPrivateChat(chatId, chatName, chatType);
      }

      const messageText =
        "text" in msg ? msg.text : "caption" in msg ? msg.caption : "";

      if (messageText && messageText.includes("#сайт")) {
        await this.handleSitePost(msg, messageText, chatId);
      }
    } catch (error) {
      console.error(
        `Error processing message/post in ${chatType} ${chatId.toString()}: ${error}`,
      );
    }
  };

  private handleNonPrivateChat = async (
    chatId: bigint,
    chatName: string,
    chatType: string,
  ) => {
    const channels = await this.channelService.getChannels();
    if (!channels.some((c) => c.channelId === chatId)) {
      await this.channelService.addChannel({
        channelId: chatId,
        name: chatName,
      });
      if (chatType === "channel") {
        await this.bot.telegram.sendMessage(
          Number(chatId),
          "Бот успешно добавлен в канал и начал отслеживание постов.",
        );
      } else {
        await this.bot.telegram.sendMessage(
          Number(chatId),
          "Бот успешно добавлен в группу и начал отслеживание сообщений.",
        );
      }
    }
  };

  private handleSitePost = async (
    msg: any,
    messageText: string,
    chatId: bigint,
  ) => {
    const postId = await this.postService.savePostToDatabase({
      telegramId: BigInt(msg.message_id),
      content: messageText,
      channelId: chatId.toString(),
    });

    if ("photo" in msg && Array.isArray(msg.photo) && msg.photo.length > 0) {
      const fileId = msg.photo[msg.photo.length - 1].file_id;
      const mediaUrl = await this.postService.uploadMediaToS3(fileId);
      await this.postService.updatePostMedia(postId, mediaUrl);
    }

  };

  private handleLeftChatMember = async (ctx: MyContext) => {
    if ((ctx.message as any)?.left_chat_member?.id === ctx.botInfo?.id) {
      const channelId = BigInt(ctx.message!.chat.id);
      try {
        await this.channelService.removeChannel(channelId);
      } catch (error) {
        console.error(`Error removing channel: ${error}`);
      }
    }
  };

  public getBotInstance(): Telegraf<MyContext> {
    return this.bot;
  }

  public launch() {
    return this.bot.launch();
  }
}

const channelService = new ChannelService();
const postService = new PostService();
export const bot = new TelegramBot(env.BOT_TOKEN, channelService, postService);
