import { Client } from "@core/Bot";
import Config from "@core/config";
import { EmbedBuilder, Message, GuildChannel, Collection, VoiceState, GuildMember, ColorResolvable } from "discord.js";
import Logger from "@includes/logger";
import moment from "moment";

//! Pamiętać o dodaniu powiadomień dla użytkowników na DM dla każdego typu 
export function MessageDelete(Message: Message) {
    if (!Config.hasGuild(Message.guildId)) {
        return;
    }

    let GuildData = Config.getGuildConfig(Message.guildId);
    let LogsChannel = Client.channels.resolve(GuildData.Notifier.messageDelete.channelId);

    if (!LogsChannel.isTextBased()) {
        return;
    }
    try {
        let embed = new EmbedBuilder()
            .setAuthor({ name: Message.member.displayName + " [" + Message.author.username + " #" + Message.author.discriminator + "]", iconURL: Message.author.displayAvatarURL() })
            .setDescription("**Deleted in **<#" + Message.channel.id + ">")
            .setColor([214, 44, 38])
            .setTimestamp(Message.createdAt)
            .setFooter({ text: "Message id: " + Message.id });

        if (Message.content.length > 0) {
            embed.addFields({ name: 'Message:', value: Message.content });
        }

        if (Message.attachments.size > 0) {
            Message.attachments.forEach((attachment) => {
                embed.setImage(attachment.url)
                embed.addFields({ name: attachment.contentType, value: attachment.url });
            });
        }
        LogsChannel.send({ embeds: [embed] }).catch(e => Logger.error(e));
    } catch (e) {
        Logger.error(e);
    };
}

export function MessageBulkDelete(Messages: Collection<string, Message>, Channel: GuildChannel) {
    if (!Config.hasGuild(Channel.guildId)) {
        return;
    }

    let GuildData = Config.getGuildConfig(Channel.guildId);
    let LogsChannel = Client.channels.resolve(GuildData.Notifier.messageDelete.channelId);

    if (!LogsChannel.isTextBased()) {
        return;
    }

    try {
        let embed = new EmbedBuilder()
            .setTitle("**Deleted in **<#" + Channel.id + ">")
            .setColor([214, 44, 38]);
        for (const [, Message] of Messages) {
            let author = Message.member.displayName + " [" + Message.author.username + " #" + Message.author.discriminator + "]";
            if (Message.content.length > 0) {
                embed.addFields({ name: author, value: Message.content });
            }
            if (Message.attachments.size > 0) {
                Message.attachments.forEach((attachment) => {
                    embed.setImage(attachment.url)
                    embed.addFields({ name: attachment.contentType, value: attachment.url });
                });
            }
        }
        LogsChannel.send({ embeds: [embed] }).catch(e => Logger.error(e));
    } catch (e) {
        Logger.error(e);
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
    LogsChannel.send({ embeds: [embed] });
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

    if (GuildData.Notifier.guildLeft.channelId != null) {
        LogsChannel.send({ embeds: [embed] })
    }

    for (var recipientId of GuildData.Notifier.guildLeft.usersDM) {
        Member.guild.members.resolve(recipientId).send({ embeds: [embed] });
    }
}