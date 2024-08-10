import { Markup } from "telegraf";

export class KeyboardService {
  static getMainMenu() {
    return Markup.keyboard([
      ["Создать проект", "Редактировать проект"],
      ["Удалить проект", "Просмотреть каналы"],
      ["Интерактивное создание проекта"],
    ]).resize();
  }

  static getYesNoKeyboard() {
    return Markup.keyboard([["Да", "Нет"]]).resize();
  }

  static getProjectListKeyboard(projects: { title: string }[]) {
    const buttons = projects.map((p, i) => [
      `${i + 1}. ${p.title.substring(0, 30)}`,
    ]);
    return Markup.keyboard(buttons).resize();
  }

  static getSkipKeyboard() {
    return Markup.keyboard([["Пропустить"]]).resize();
  }

  static getBackKeyboard() {
    return Markup.keyboard([["Назад"]]).resize();
  }
}
