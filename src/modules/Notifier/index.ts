import { EventsManager } from "@core/Bot";
import { Events } from "discord.js";
import cfg from "./config";
import { MessageDelete, MessageBulkDelete, MemberRemoved, VoiceStateChange } from "./notify"

function execute() {
    EventsManager.addEventTask(Events.MessageDelete, (Message) => MessageDelete(Message));
    EventsManager.addEventTask(Events.MessageBulkDelete, (Messages, Channel) => MessageBulkDelete(Messages, Channel));
    EventsManager.addEventTask(Events.VoiceStateUpdate, (OldState, NewState) => VoiceStateChange(OldState, NewState));
    EventsManager.addEventTask(Events.GuildMemberRemove, (Member) => MemberRemoved(Member));
}

export default { cfg, execute };