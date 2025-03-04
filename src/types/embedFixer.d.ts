import { EmbedBuilder } from "discord.js";

export type fxTwitterApiResponse = {
    code: number;
    message: string;
    tweet: {
        url: string;
        id: string;
        text: string;
        author: {
            id: string;
            name: string;
            screen_name: string;
            avatar_url: string;
            banner_url: string;
            description: string;
            location: string;
            url: string;
            followers: number;
            following: number;
            joined: string;
            likes: number;
            website: {
                url: string;
                display_url: string;
            } | null;
            tweets: number;
            avatar_color: string | null;
        };
        replies: number;
        retweets: number;
        likes: number;
        created_at: string;
        created_timestamp: number;
        possibly_sensitive: boolean;
        views: number;
        is_note_tweet: boolean;
        community_note: {
            text: string;
            entities: {
                fromIndex: number;
                toIndex: number;
                ref: {
                    type: string;
                    url: string;
                    urlType: string;
                };
            }[];
        } | null;
        lang: string;
        replying_to: string | null;
        replying_to_status: string | null;
        media?: {
            all: {
                type: string;
                url: string;
                width: number;
                height: number;
                altText: string;
                thumbnail_url?: string;
                duration?: number;
                format?: string;
                variants?: {
                    content_type: string;
                    url: string;
                    bitrate?: number;
                }[];
            }[];
            photos?: fxTwitterApiMediaPhoto[];
            videos?: fxTwitterApiMediaVideo[];
        };
        quote?: {
            url: string;
            id: string;
            text: string;
            author: {
                id: string;
                name: string;
                screen_name: string;
                avatar_url: string;
                banner_url: string;
                description: string;
                location: string;
                url: string;
                followers: number;
                following: number;
                joined: string;
                likes: number;
                website: {
                    url: string;
                    display_url: string;
                } | null;
                tweets: number;
                avatar_color: string | null;
            };
            replies: number;
            retweets: number;
            likes: number;
            created_at: string;
            created_timestamp: number;
            possibly_sensitive: boolean;
            views: number;
            is_note_tweet: boolean;
            community_note: {
                text: string;
                entities: {
                    fromIndex: number;
                    toIndex: number;
                    ref: {
                        type: string;
                        url: string;
                        urlType: string;
                    };
                }[];
            } | null;
            lang: string;
            replying_to: string | null;
            replying_to_status: string | null;
            media?: {
                all: {
                    type: string;
                    url: string;
                    width: number;
                    height: number;
                    altText: string;
                    thumbnail_url?: string;
                    duration?: number;
                    format?: string;
                    variants?: {
                        content_type: string;
                        url: string;
                        bitrate?: number;
                    }[];
                }[];
                photos?: fxTwitterApiMediaPhoto[];
                videos?: fxTwitterApiMediaVideo[];
            };
            source: string;
            twitter_card: string;
            color: string | null;
            provider: string;
        };
        source: string;
        twitter_card: string;
        color: string | null;
        provider: string;
    };
}

type fxTwitterApiMediaPhoto = {
    type: string;
    url: string;
    width: number;
    height: number;
    altText: string;
}

type fxTwitterApiMediaVideo = {
    url: string;
    thumbnail_url: string;
    duration: number;
    width: number;
    height: number;
    format: string;
    type: string;
    variants: {
        content_type: string;
        url: string;
        bitrate?: number;
    }[];
}

type EmbedFixerReply = {
    content: string;
    embed?: EmbedBuilder;
}