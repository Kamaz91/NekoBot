import EventsManager from "@core/EventsManager";
import { Events } from "discord.js";
import cfg from "./config";
import { MessageDelete, MessageBulkDelete, MemberRemoved, VoiceStateChange } from "./notify"
import ModuleManager from "@core/ModuleManager";
import { ModuleBuilder } from "@src/utils";
import logger from "@includes/logger";

const module = new ModuleBuilder();

module.setConfig(cfg.sql, cfg.template, cfg.prepareData);
module.setExecute(() => {
    logger.info("Notifier Execute");
    EventsManager.addEventTask(Events.MessageDelete, (Message) => MessageDelete(Message));
    EventsManager.addEventTask(Events.MessageBulkDelete, (Messages, Channel) => MessageBulkDelete(Messages, Channel));
    EventsManager.addEventTask(Events.VoiceStateUpdate, (OldState, NewState) => VoiceStateChange(OldState, NewState));
    EventsManager.addEventTask(Events.GuildMemberRemove, (Member) => MemberRemoved(Member));
});
ModuleManager.addModule("Notifier", module.cfg, module.execute);

export default module;