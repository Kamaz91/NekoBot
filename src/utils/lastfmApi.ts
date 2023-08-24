import axios, { AxiosRequestConfig } from "axios";

interface ArtistMinimal {
    url?: string;
    mbid: string;
    "#text": string;
}

interface ErrorMessage {
    message: string;
    error: number;
}

interface Albumtag {
    url: string;
    name: string;
}

interface AlbumImage {
    size: "small" | "medium" | "large" | "extralarge" | "mega" | "";
    "#text": string;
}

interface AlbumTrack {
    streamable: {
        fulltrack: string;
        "#text": string;
    }
    duration: number;
    url: string;
    name: string;
    "@attr": { rank: number }
    artist: ArtistMinimal;
}

interface Album {
    artist: string;
    mbid: string;
    name: string;
    tags: { tag: Albumtag[] }
    image: AlbumImage[]
    tracks: { track: AlbumTrack[] }
    listeners: string;
    playcount: string;
    url: string;
}

interface AlbumInfo {
    album: Album;
}

interface AlbumChart {
    artist: ArtistMinimal,
    mbid: string;
    url: string;
    name: string;
    "@attr": {
        rank: string;
    }
    playcount: string;
}

interface WeeklyAlbumChart {
    error: ErrorMessage;
    weeklyalbumchart: {
        album: AlbumChart[];
        "@attr": {
            from: string;
            to: string;
            user: string;
        }
    }
}

export default class LastfmApi {
    apikey: string;
    constructor(apikey: string) {
        this.apikey = apikey;
    }

    async getWeeklyAlbumChart(user: String): Promise<WeeklyAlbumChart | ErrorMessage> {
        let opts: AxiosRequestConfig = {
            baseURL: "http://ws.audioscrobbler.com",
            url: "/2.0",
            method: "get",
            params: {
                method: "user.getweeklyalbumchart",
                api_key: this.apikey,
                user: user,
                format: "json"
            }
        }
        return axios(opts).then(res => res.data).catch((res) => res.response.data);
    }
    async getAlbumInfo(artist: String, album: String): Promise<AlbumInfo | ErrorMessage> {
        let opts: AxiosRequestConfig = {
            baseURL: "http://ws.audioscrobbler.com",
            url: "/2.0",
            method: "get",
            params: {
                method: "album.getinfo",
                api_key: this.apikey,
                artist: artist,
                album: album,
                format: "json"
            }
        }
        return axios(opts).then(res => res.data).catch((res) => res.response.data);
    }
    isError(response: WeeklyAlbumChart | AlbumInfo | ErrorMessage): response is ErrorMessage {
        if ("error" in response && "message" in response) {
            return true;
        }
        return false;
    }
}