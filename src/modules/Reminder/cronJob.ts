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
    if (data.length > 0) {
        for (let el of data) {
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
        .then(rows => rows)
        .catch((error) => {
            logger.error("Reminder updateReminded error");
            logger.error(JSON.stringify(error));
            return [];
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
        .then()
        .catch((error) => {
            logger.error("Reminder updateReminded error");
            logger.error(JSON.stringify(error));
        });
}