const moment = require('moment');

module.exports = (Connection) => {
    return {
        /**
         * Insert message autoPurge
         * @param {string} guild_id - The id of the guild.
         * @param {string} channel_id - The id of the channel.
         * @param {string} message_id - The id of the message.
         * @returns {Promise} Connection Promise object
         */
        insertMessage: (guild_id, channel_id, message_id) => {
            return Connection('auto_purge_messages')
                .insert({
                    message_id: message_id,
                    channel_id: channel_id,
                    guild_id: guild_id,
                    create_timestamp: moment().valueOf()
                })
                .then()
                .catch(console.error);
        },
        /**
         * Delete message from autoPurge
         * @param {string} message_id - The message id.
         * @returns {Promise} Connection Promise object
         */
        deleteMessage: (message_id) => {
            return Connection('auto_purge_messages')
                .where('message_id', message_id)
                .del()
                .then()
                .catch(console.error);
        },
        /**
         * Delete messages from autoPurge
         * @param {string} messageArray - The array of messages id.
         * @returns {Promise} Connection Promise object
         */
        deleteMessagesArray: (messageArray) => {
            return Connection('auto_purge_messages')
                .whereIn('message_id', messageArray)
                .del()
                .then()
                .catch(console.error);
        },
    }
}