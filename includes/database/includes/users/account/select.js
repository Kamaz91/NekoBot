module.exports = (Connection) => {
    return {
        /**
         * @param user_id discord id of the user
         * @returns {Promise} Connection Promise object
         */
        byUserId: (user_id) => {
            return Connection('users')
                .select('*')
                .where({ "user_id": user_id })
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: 1, request: rows[0] };
                    } else {
                        return { status: 0, request: "User not found" }
                    }
                })
                .catch(err => {
                    console.log(err);
                    return { status: 0, request: "User not found" }
                });
        },
        /**
         * @param id id of the user
         * @returns {Promise} Connection Promise object
         */
        byId: (id) => {
            return Connection('users')
                .select('*')
                .where({ "id": id })
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: 1, request: rows[0] };
                    } else {
                        return { status: 0, request: "User not found" }
                    }
                })
                .catch(err => {
                    console.log(err);
                    return { status: 0, request: "User not found" }
                });
        }
    }
}