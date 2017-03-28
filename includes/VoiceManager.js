var method = voiceManager.prototype;
function voiceManager() {
    this.queue;
    this.voiceChannel;
    this.playingVChannel;
    this.dispatcher;

    this.playing = false;
    this.paused = false;

    this.ytdl = require('ytdl-core');
    this.streamOptions = {seek: 0, volume: 1};
}


method.joinVChannel = function (vChannel) {
    if (vChannel.joinable) {
        this.voiceChannel = vChannel;
        this.playingVChannel = vChannel.join();
        return true;
    } else {
        return false;
    }
};

method.streamToVChannel = function (trigger, vChannel) {
    if (this.joinVChannel(vChannel)) {
        if (this.playing === false) {
            this.playing = true;
            this.playingVChannel.then(connection => {
                const stream = this.ytdl(trigger.text, {filter: 'audioonly'});
                this.dispatcher = connection.playStream(stream, this.streamOptions);

                this.dispatcher.on('start', information => {

                    //console.log(this.ytdl.getInfo);
                    console.log('Stream Start');
                });
                this.dispatcher.on('speaking', information => {

                    //console.log(this.ytdl.getInfo);
                    //console.log('Playing sound');
                });
                this.dispatcher.on('error', information => {
                    this.leave();
                    //console.log(this.ytdl.getInfo);
                    console.log('Stream error');
                });
                this.dispatcher.on("end", end => {
                    console.log('Stream end');
                    this.leave();
                    /*if(queue is empty){
                     leave
                     clear dispacher data
                     }else{
                     play next song from list
                     }*/
                });
            }).catch(console.error);
            return 2;
        } else {
            return 1;
        }
    } else {
        return 0;
    }

};

method.leave = function (error) {
    console.log('error::');
    console.log(error);
    console.log('::');
    this.playing = false;
    this.voiceChannel.leave();
    console.log('dupa leave');
};

method.stop = function (uid) {
    if (this.playing === true) {
        this.dispatcher.end();
        return true;
    } else {
        return false;
    }
};

method.pause = function (uid) {
    if (this.paused === false) {
        this.paused = true;
        this.dispatcher.pause();
        return true;
    } else {
        return false;
    }
};

method.resume = function (uid) {
    if (this.paused === true) {
        this.paused = false;
        this.dispatcher.resume();
        return true;
    } else {
        return false;
    }
};

method.volume = function (uid, volume) {
    if (Number.isInteger(volume)) {
        this.dispatcher.setVolumeLogarithmic(volume);
        this.streamOptions.volume = volume;
        return true;
    } else {
        return false;
    }

};

method.skipSong = function (uid, link) {
    if (this.checkLink(link) === true) {
        //add
    }
};

method.addQueue = function (uid, link) {
    if (this.checkLink(link) === true) {
        //add
    }

};

method.checkLink = function (link) {
    //check if is a yt link
};

method.setVoiceChannel = function (link) {
    //check if is a yt link
};

module.exports = voiceManager;