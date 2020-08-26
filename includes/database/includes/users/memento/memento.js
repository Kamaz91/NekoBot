const moment = require('moment');

module.exports = (Connection) => {
    return {
        addReminder(data) {
            return Connection('memento_data')
                .insert({
                    user_id: data.user_id,
                    guild_id: data.guild_id,
                    channel_id: data.channel_id,
                    message_id: data.message_id,
                    additional_text: data.additional_text,
                    created_timestamp: moment().valueOf(),
                    fulfillment_timestamp: data.fulfillment_timestamp,
                    is_active: 1
                })
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: true, error: false, request: rows[0] };
                    } else {
                        return { status: false, error: false, request: "Cant add" }
                    }
                })
                .catch((error) => {
                    return { status: false, error: true, request: error }
                });
        },
        updateReminded(id) {
            return Connection('memento_data')
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
        },
        fetchActiveData() {
            return Connection('memento_data')
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
    }
}