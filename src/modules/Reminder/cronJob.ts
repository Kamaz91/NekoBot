import { CronJob } from "cron";
import { Client } from "@src/core/Bot";
import { Database } from "@includes/database";
import logger from "@includes/logger";
import moment from "moment";
import { EmbedBuilder } from "discord.js";

var reminderLoop = new CronJob('0 */1 * * * *', ReminderJob);

export function StartCron() {
    logger.info("Reminder: cronJob started");
    reminderLoop.start();
}

async function ReminderJob() {
    logger.info("Reminder: checking...");
    var data = await fetchActiveData();
    if (data.status) {
        for (let el of data.elements) {
            var user = await Client.users.fetch(el.user_id);

            const embed = new EmbedBuilder()
                .setTimestamp()
                .setDescription('Reminder')
                .addFields({ name: 'Link to the message', value: el.message_link })
                .setColor([37, 154, 72]) //#259A48
                .addFields({ name: 'Text:', value: el.additional_text });

            user.send({ embeds: [embed] })
                .catch((error) => {
                    logger.error("Reminder ReminderJob user send error");
                    logger.error(JSON.stringify(error));
                });

            updateReminded(el.id);
        }
    }
}

function fetchActiveData() {
    return Database().table('memento_data')
        .where({
            is_active: 1
        })
        .andWhere(
            'fulfillment_timestamp', '<', moment().valueOf()
        )
        .then((rows) => {
            if (rows.length > 0) {
                return { status: 1, elements: rows };
            } else {
                return { status: 0, elements: "no data" }
            }
        })
        .catch((error) => {
            return { status: 0, elements: null, error: error }
        });
}

function updateReminded(id) {
    return Database().table('memento_data')
        .update({
            is_active: 0
        })
        .where({
            id: id
        })
        .then((rows) => {
            if (rows > 0) {
                return { status: true, error: false, request: rows[0] };
            } else {
                return { status: false, error: false, request: "Cant update" }
            }
        })
        .catch((error) => {
            return { status: false, error: true, request: error }
        });
}