import { AutoPurgeSettings, GuildMember, LinkChangerSettings, LogsType } from "./database";
export interface ConfigModule {
    enabled: boolean;
}

export interface AutoPurge extends ConfigModule {
    channels: Map<string, AutoPurgeSettings>
}

export interface MessageCounter extends ConfigModule {
    bots: boolean,
    is_hidden: boolean,
    listing: {
        type: "all" | "whitelist" | "blacklist"; // whitelist, blacklist, all
        channels: Map<string, { id: string }>;
    }
}


export interface LogsChannels extends ConfigModule {
    activity: string;
    voice: string;
}

export interface LinkChanger extends ConfigModule {
    urls: Array<{
        type: "reply" | "delete";
        removeText: boolean
        domain: string;
        domainChangeTo: string;
        tld: string;
        tldChangeTo: string;
        bots: boolean;
    }>
}

export interface Notifier {
    messageDelete: {
        channelId: string;
        usersDM: string[]
    };
    voiceChange: {
        channelId: string;
        usersDM: string[]
    };
    guildLeft: {
        channelId: string;
        usersDM: string[]
    };
}

export interface ConfigModules {
    AutoPurge: AutoPurge,
    MessageCounter: MessageCounter,
    Quotes: ConfigModule,
    LogsChannels: LogsChannels,
    Notifier: Notifier,
    LinkChanger: LinkChanger
}

export type Config = Map<string, ConfigModules>;