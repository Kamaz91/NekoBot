import EventsManager from "../../core/EventsManager.js";
import { Events } from "discord.js";
import cfg from "./config.js";
import { MessageDeleteNotice, MessageBulkDeleteNotice, MemberRemoved, VoiceStateChange } from "./notify.js"
import { ModuleBuilder } from "../..//utils/index.js";
import logger from "../../services/logger/index.js";
import ModuleManager from "../../core/ModuleManager.js";

const module = new ModuleBuilder();

module.setConfig(cfg.sql, cfg.template, cfg.prepareData);
module.setExecute(() => {
    logger.info("Notifier Execute");
    EventsManager.addEventTask(Events.MessageDelete, (Message) => MessageDeleteNotice(Message));
    EventsManager.addEventTask(Events.MessageBulkDelete, (Messages, Channel) => MessageBulkDeleteNotice(Messages, Channel));
    EventsManager.addEventTask(Events.VoiceStateUpdate, (OldState, NewState) => VoiceStateChange(OldState, NewState));
    EventsManager.addEventTask(Events.GuildMemberRemove, (Member) => MemberRemoved(Member));
});
ModuleManager.addModule("Notifier", module.cfg, module.execute);

export default module;