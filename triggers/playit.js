
/* global PlayIt */

var method = play.prototype;
function play(message, trigger) {
    var help = 'playit yt link / stop / pause / resume / * setvoicechan * / *volume*';
    switch (trigger.splitTigger[1]) {
        case 'stop' :
            PlayIt.stop(message.author.id);
            break;
        case 'pause' :
            PlayIt.pause(message.author.id);
            break;
        case 'resume' :
            PlayIt.resume(message.author.id);
            break;
        case 'volume' :
            (PlayIt.volume(message.author.id, parseInt(trigger.splitTigger[2]))) ? false : message.reply('Obecna głośność: ' + PlayIt.streamOptions.volume);
            break;
        case 'setvoicechan' :
            message.reply('Work in progress');
            break;
        case 'forcestop' :
            PlayIt.leave();
            break;
        case 'help':
            message.reply(help);
            break;

        default:
            if (trigger.text.length <= 0)
                message.reply(help);
            else {
                message.reply(PlayIt.streamToVChannel(trigger, message.member.voiceChannel).text);
            }
    }

    /*
     var voiceChannel = message.member.voiceChannel;
     
     // play streams using ytdl-core
     const ytdl = require('ytdl-core');
     const streamOptions = {
     seek: 0, volume: 1};
     voiceChannel.join().then(connection => {
     const stream = ytdl(trigger.text, {filter: 'audioonly'});
     const dispatcher = connection.playStream(stream, streamOptions);
     
     dispatcher.on('start', information => {
     
     console.log(ytdl.getInfo);
     console.log('Stream Start');
     });
     dispatcher.on("end", end => {
     console.log(end);
     voiceChannel.leave();
     });
     }).catch(console.error);
     /*
     voiceChannel.join().then(connection => {
     dispatcher = connection.playFile('./common/audio/Heil_Hitler,Bitch!.mp3');
     dispatcher.on('debug', information => {
     console.log(information);
     });
     dispatcher.on('start', information => {
     console.log('Stream Start');
     });
     dispatcher.on("end", end => {
     console.log(end);
     voiceChannel.leave();
     });
     }).catch(err => console.log(err));*/
}
module.exports = play; 