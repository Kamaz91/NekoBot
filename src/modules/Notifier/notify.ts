import { Client } from "../../core/Bot.js";
import Config from "../../core/Config.js";
import { EmbedBuilder, Message, GuildChannel, Collection, VoiceState, GuildMember, ColorResolvable, AttachmentBuilder, Attachment, Embed } from "discord.js";
import Logger from "../../services/logger/index.js";
import moment from "moment";

import { downloadFile } from "../../utils/imageDownload.js";

const AllowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/bmp", "image/tiff", "text/plain", "text/plain; charset=utf-8"];

//! Pamiętać o dodaniu powiadomień dla użytkowników na DM dla każdego typu 
export async function MessageDeleteNotice(Message: Message) {
    if (!Config.hasGuild(Message.guildId)) {
        return;
    }

    processAndSendMessage(Message, false);
}

export async function MessageBulkDeleteNotice(Messages: Collection<string, Message>, Channel: GuildChannel) {
    if (!Config.hasGuild(Channel.guildId)) {
        return;
    }

    for (const [, Message] of Messages) {
        processAndSendMessage(Message, true);
    }
}

export function VoiceStateChange(OldState: VoiceState, NewState: VoiceState) {
    // Discord.js always brings OldState and NewState data
    let GuildId = OldState.guild.id;
    if (!Config.hasGuild(GuildId)) {
        return;
    }

    let GuildData = Config.getGuildConfig(GuildId);

    if (GuildData.Notifier.voiceChange.channelId == null) {
        return;
    }

    let LogsChannel = Client.channels.resolve(GuildData.Notifier.voiceChange.channelId);

    if (!LogsChannel.isTextBased()) {
        return;
    }

    var data: {
        author: GuildMember;
        action: string;
        channel: string;
        color: ColorResolvable
    }
    if (OldState.channelId == null) {
        //* Joined to voice channel
        data = {
            author: NewState.member,
            action: "Joined",
            channel: `<#${NewState.channel.id}>`,
            color: [79, 214, 38]
        }
    } else if (NewState.channelId && OldState.channelId) {
        //* Switched voice channels
        data = {
            author: NewState.member,
            action: "Switched",
            channel: `From <#${OldState.channel.id}> To <#${NewState.channel.id}>`,
            color: [33, 108, 198]
        }
    } else {
        //* Left voice channel
        data = {
            author: OldState.member,
            action: "Left",
            channel: `<#${OldState.channel.id}>`,
            color: [214, 44, 38]
        }
    }
    let embed = new EmbedBuilder()
        .setColor(data.color)
        .setAuthor({ name: data.author.displayName, iconURL: data.author.displayAvatarURL() })
        .addFields({ name: data.action, value: data.channel })
        .setTimestamp()
    if (LogsChannel.isSendable()) {
        LogsChannel.send({ embeds: [embed] })
            .catch(e => {
                Logger.error("Notifier: VoiceStateChange notify send to channel error");
                Logger.error(JSON.stringify(e));
            });
    }
}


export function MemberRemoved(Member: GuildMember) {
    if (!Config.hasGuild(Member.guild.id)) {
        return;
    }

    let GuildData = Config.getGuildConfig(Member.guild.id);
    let LogsChannel = Client.channels.resolve(GuildData.Notifier.guildLeft.channelId);

    if (!LogsChannel.isTextBased() || GuildData.Notifier.guildLeft.usersDM.length > 0) {
        return;
    }

    var user = {
        left: moment(new Date()),
        join: moment(Member.joinedAt)
    };

    var duration = moment.duration(user.left.diff(user.join));
    var timestring =
        `Joined: ${user.join.format("DD/MM/YYYY, HH:mm:ss")}\n` +
        `Spent: ` +
        `${duration.years()} Years, ` +
        `${duration.months()} Months, ` +
        `${duration.days()} Days, ` +
        `${duration.hours()} Hours, ` +
        `${duration.minutes()} Minutes, ` +
        `${duration.seconds()} Seconds`;

    const embed = new EmbedBuilder()
        .setTimestamp()
        .setAuthor({ name: Member.displayName + "#" + Member.user.discriminator, iconURL: Member.displayAvatarURL() })
        .setThumbnail(Member.guild.iconURL())
        .setDescription('**Left** ' + Member.guild.name)
        .addFields({ name: 'Time', value: timestring })
        .setFooter({ text: 'User Id: ' + Member.id })
        .setColor([214, 44, 38]);

    if (GuildData.Notifier.guildLeft.channelId != null && LogsChannel.isSendable()) {
        LogsChannel.send({ embeds: [embed] })
    }

    for (var recipientId of GuildData.Notifier.guildLeft.usersDM) {
        Member.guild.members.resolve(recipientId).send({ embeds: [embed] })
            .catch(e => {
                Logger.error("Notifier: Member Removed notify send to user error");
                Logger.error(JSON.stringify(e));
            });
    }
}

async function processAndSendMessage(Message: Message, isBulk: boolean) {
    let attachments: AttachmentBuilder[] = [];
    let embeds: Embed[] = [];

    let GuildData = Config.getGuildConfig(Message.guildId);
    let LogsChannel = Client.channels.resolve(GuildData.Notifier.messageDelete.channelId);

    if (!LogsChannel.isTextBased()) {
        return;
    }

    Logger.debug("[Notifier] attachments: " + Message.attachments.size);
    Logger.debug("[Notifier] content: " + Message.content);
    Logger.debug("[Notifier] isBulk: " + isBulk);
    Logger.debug("[Notifier] channel: " + Message.channel.id);
    Logger.debug("[Notifier] guild: " + Message.guildId);
    Logger.debug("[Notifier] author: " + Message.author.username + "#" + Message.author.discriminator);
    Logger.debug("[Notifier] type: " + Message.type);

    if (Message.attachments.size > 0) {
        attachments = await composeAttachments(Message.attachments)
            .catch((err) => {
                Logger.error("[Notifier] error while composing attachments");
                Logger.error(err);
                return [];
            });
    }

    let embed = new EmbedBuilder()
        .setAuthor({ name: Message.member.displayName + " [" + Message.author.username + " #" + Message.author.discriminator + "]", iconURL: Message.author.displayAvatarURL() })
        .setDescription(`**${isBulk ? "Bulk " : ""}Deleted in** <#${Message.channel.id}>`)
        .setColor([214, 44, 38])
        .setTimestamp(Message.createdAt)
        .setFooter({ text: "User Id: " + Message.author.id })

    if (Message.attachments.size > 0) {
        let i = 1;
        embed.addFields({ name: 'Attachments:', value: Message.attachments.map((el) => `${i++}: ` + el.contentType).join("\n") });
    }

    if (Message.embeds.length > 0) {
        embed.addFields({ name: 'Embeds count:', value: Message.embeds.length.toString() });
    }

    if (Message.content.length > 0) {
        embed.addFields({ name: 'Message:', value: Message.content });
    }

    if (LogsChannel.isSendable()) {
        LogsChannel.send({ embeds: [embed, ...Message.embeds], files: attachments })
            .catch(e => {
                Logger.error("Notifier: Message Delete notify send to channel error");
                Logger.error(JSON.stringify(e));
            });
    }
}

async function composeAttachments(attachments: Collection<string, Attachment>): Promise<AttachmentBuilder[]> {
    let filesDownloadTasks: Promise<{ data: Buffer, name: string }>[] = [];
    let files: AttachmentBuilder[] = [];

    for (const [id, attachment] of attachments) {
        Logger.debug("[Notifier] Attachment id: " + id);
        Logger.debug("[Notifier] Attachment name: " + attachment.name);
        Logger.debug("[Notifier] Attachment type: " + attachment.contentType);

        if (AllowedTypes.includes(attachment.contentType)) {
            let task = (async () => {
                return { name: attachment.name, data: await downloadFile(attachment.url) };
            })();
            filesDownloadTasks.push(task);
        }
    }

    let images = await Promise.allSettled(filesDownloadTasks);
    images.forEach((result) => {
        if (result.status === "fulfilled") {
            files.push(new AttachmentBuilder(result.value.data, { name: result.value.name }));
        } else {
            Logger.warn("[Notifier] Failed to download attachment: " + result.reason);
        }
    });

    return files;
}