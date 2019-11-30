class presenceUpdate {
    constructor(args) {
        this.oldMember = args[0];
        this.newMember = args[1];

        try {
            if (!this.newMember.user.bot || !this.oldMember.user.bot) {
                var nmp = this.newMember.presence;
                var omp = this.oldMember.presence;
                var data = {};

                data.userId = this.newMember.id;
                data.guildId = this.newMember.guild.id;
                data.nmom = 1;
                data.timestamp = Date.now();
                data.status = nmp.status;
                data.ostatus = omp.status;

                if (nmp.game) {
                    data.gameName = nmp.game.name;
                    data.gameState = nmp.game.state;
                    data.gameDetails = nmp.game.details;

                    if (nmp.game.applicationID) {
                        data.gameId = nmp.game.applicationID;
                    }
                    if (nmp.game.timestamps) {
                        if (nmp.game.timestamps.start) {
                            data.gameStart = new Date(nmp.game.timestamps.start).getTime();
                        }
                        if (nmp.game.timestamps.end) {
                            data.gameEnd = new Date(nmp.game.timestamps.end).getTime();
                        }
                    }
                    //console.log(data);
                    knex('presenceupdate').insert(data).then();
                }
            }
        } catch (e) {
            console.log('Presense status log error!');
            console.log(e);
        }

    }
}

module.exports = presenceUpdate;