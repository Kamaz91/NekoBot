
var method = pisz.prototype;
function pisz(message, trigger) {

    /* Alfabet pasujących znaków*/
    var alfafbet = 'abcdefghijklmnopqrstuvwxyz';
    /* Budowanie stringa */
    var stringBuild = '';
    /* Iteracja pojedyńczych znaków w stringu */
    for (var val of trigger.text) {

        /* Pojedyńczy znak zmieniany na mały */
        var char = val.toString().toLocaleLowerCase();
        /* Zamiana polskich znaków na zwykłe */
        switch (char) {
            case 'ą':
                char = 'a';
                break;
            case 'ę':
                char = 'e';
                break;
            case 'ć':
                char = 'c';
                break;
            case 'ł':
                char = 'l';
                break;
            case 'ń':
                char = 'n';
                break;
            case 'ó':
                char = 'o';
                break;
            case 'ś':
                char = 's';
                break;
            case 'ż':
                char = 'z';
                break;
            case 'ź':
                char = 'z';
                break;
        }
        /* Jeśli znak jest w alfabecie */
        if (alfafbet.indexOf(char) > -1) {
            stringBuild += ':regional_indicator_' + char.toString() + ':';
        } else
        /* Jeśli znak jest pytajnikiem */
        if ('?' === char) {
            stringBuild += ':grey_question:';
        } else
        /* Jeśli znak jest wykrzynikiem */
        if ('!' === char) {
            stringBuild += ':grey_exclamation:';
        } else
        if (' ' === char) {
            stringBuild += '  ';
        } else {
            /* Jeśli znak jest odstępem podwójna spacja */
            stringBuild += char;
        }
        //console.log(val);
    }
    /* Wysłanie wiadomości do kanału/użytkownika */
    message.channel.send(stringBuild);
}
module.exports = pisz;