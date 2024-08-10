import { Context, Scenes } from "telegraf";
import { NewProject } from "../db/schema";

export interface MyWizardSession extends Scenes.WizardSessionData {
  projectData?: Partial<NewProject>;
  projectId?: number;
}

export interface MyContext extends Context {
  scene: Scenes.SceneContextScene<MyContext, MyWizardSession>;
  wizard: Scenes.WizardContextWizard<MyContext>;
}
