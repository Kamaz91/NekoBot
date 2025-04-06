import { loadImage, createCanvas } from 'canvas';

export async function processImage(url: string, artistName: string, albumName: string, playcount: string): Promise<Buffer> {
    // Capitalize first letter
    albumName = albumName.split("").map((val, index) => index == 0 ? val.toUpperCase() : val).join("");
    const width = 300;
    const height = 300;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    const imgText = `${artistName}\n${albumName}\nPlays:${playcount}`;

    context.quality = "best";

    if (url) {
        let imgdata = await loadImage(url);
        context.drawImage(imgdata, 0, 0);
    } else {
        context.fillStyle = "#000000";
        context.fillRect(0, 0, width, height);
    }

    context.font = 'bold 13pt Courier';
    context.shadowColor = "#000";
    context.shadowBlur = 3;
    context.fillStyle = '#fafafa';
    context.fillText(imgText, 10, 20);

    return canvas.toBuffer('image/png');
}
