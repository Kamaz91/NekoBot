class userUpdate {
    constructor(args) {
        this.oldUser = args[0];
        this.newUser = args[1];

        try {
            if (!this.newUser.bot) {
                var diff = {};
                this.oldUser.username !== this.newUser.username ? diff.username = this.newUser.username : false;
                this.oldUser.avatar !== this.newUser.avatar ? diff.avatar_id = this.newUser.avatar : false;
                this.oldUser.discriminator !== this.newUser.discriminator ? diff.discriminator = this.newUser.discriminator : false;

                knex('members').update(diff).where({ user_id: this.newUser.id })
                    .then()
                    .catch(console.error);
            }
        } catch (e) {
            console.log(e);
        }

    }
}

module.exports = userUpdate;