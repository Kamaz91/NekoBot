import { InteractionBuilder } from "@src/utils";
import InteractionManager from "@core/InteractionManager";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Database } from "@includes/database";
import moment from "moment";
import logger from "../includes/logger";

const Command = new InteractionBuilder("reminder").SlashCommand(execute, "infinite");
InteractionManager.addGlobalInteraction(Command);

async function execute(interaction: CommandInteraction) {
    const options = {
        year: Number.parseInt(interaction.options.get("year").value.toString()),
        month: Number.parseInt(interaction.options.get("month").value.toString()) - 1,
        day: Number.parseInt(interaction.options.get("day").value.toString()),
        hour: Number.parseInt(interaction.options.get("hour").value.toString()),
        minute: Number.parseInt(interaction.options.get("minute").value.toString()),
        text: interaction.options.get("text").value.toString(),
    };

    let momtime = moment();

    try {
        momtime.year(options.year);
        momtime.month(options.month);
        momtime.date(options.day);
        momtime.hour(options.hour);
        momtime.minute(options.minute);
        momtime.second(0);
    } catch (e) {
        interaction.reply({ content: 'Invalid format', ephemeral: true });
        return;
    }

    if (momtime.valueOf() < moment().valueOf()) {
        interaction.reply({ content: 'Cannot be in the past!', ephemeral: true });
        return;
    }

    if (!options.text) {
        interaction.reply({ content: "Text is empty", ephemeral: true })
            .catch();
        return;
    }

    // default limit 15
    if (await isUserReachActiveReminderLimit(interaction.user.id, 15)) {
        interaction.reply({ content: "You have reached the limit of 15 active reminders", ephemeral: true })
            .catch();
        return;
    }

    const embed = new EmbedBuilder()
        .setTimestamp()
        .setAuthor({ name: interaction.user.username + "#" + interaction.user.discriminator, iconURL: interaction.user.displayAvatarURL({ size: 128, extension: "webp" }) })
        .setDescription('Preparing data...')
        .addFields({ name: 'Time', value: momtime.format('DD/MM/YYYY HH:mm') })
        .setColor([37, 154, 72]) //#259A48
        .addFields({ name: "Text", value: options.text });

    await interaction.reply({ content: "Preparing data...", embeds: [embed], ephemeral: true })
        .catch();
    let replyMessage = await interaction.fetchReply();
    
    if (await addReminder({
        user_id: interaction.user.id,
        channel_id: interaction.channelId,
        guild_id: interaction.inGuild() ? interaction.guildId : null,
        message_id: replyMessage.id,
        message_link: replyMessage.url,
        type: interaction.inGuild() ? "guild" : "dm",
        additional_text: options.text,
        fulfillment_timestamp: momtime.valueOf()
    })) {
        embed.setDescription("Reminder added!");
        interaction.editReply({ content: "Reminder added!", embeds: [embed] })
    } else {
        embed.setDescription("Something went wrong,can't add reminder!");
        interaction.editReply({ content: "Something went wrong. :(", embeds: [embed] })
    }
}

function addReminder(data) {
    return Database()
        .table('memento_data')
        .insert({
            user_id: data.user_id,
            guild_id: data.guild_id,
            channel_id: data.channel_id,
            message_id: data.message_id,
            message_link: data.message_link,
            type: data.type,
            additional_text: data.additional_text,
            created_timestamp: moment().valueOf(),
            fulfillment_timestamp: data.fulfillment_timestamp,
            is_active: 1
        })
        .then((rows) => {
            if (rows.length > 0) {
                return true;
            } else {
                logger.error("Reminder: the reminder has not been inserted into the database");
                return false;
            }
        })
        .catch((error) => {
            logger.error("Reminder: Cant add reminder to database");
            logger.error(JSON.stringify(error));
            return false;
        });
}

function isUserReachActiveReminderLimit(user_id, Limit) {
    return Database()
        .table('memento_data')
        .select()
        .where({
            user_id: user_id,
            is_active: 1
        })
        .then((rows) => {
            return rows.length >= Limit ? true : false;
        })
        .catch((error) => {
            logger.error("Reminder: Error While checking reminders");
            logger.error(JSON.stringify(error));
            return false;
        });
}