import { Knex } from 'knex';

import { ApiTokens, User, GuildMember, Guild, GuildChannel, MessageCounterUserStats, AutoPurgeSettings, AutoPurgeMessage } from './database'

declare module 'knex/types/tables' {
    interface Tables {
        api_tokens: ApiTokens;
        api_tokens_composite: Knex.CompositeTableType<
            ApiTokens
        >;
        users: User;
        users_composite: Knex.CompositeTableType<
            User,
            Pick<User, 'user_id'> & Partial<Pick<User, 'created_timestamp' | 'modified_timestamp'>>,
            Partial<Omit<User, 'id'>>
        >;
        members: GuildMember;
        members_composite: Knex.CompositeTableType<GuildMember>;
        guilds: Guild;
        guilds_composite: Knex.CompositeTableType<
            Guild,
            Partial<Omit<Guild, 'id'>
            >>;
        guilds_channels: GuildChannel;
        guilds_channels_composite: Knex.CompositeTableType<GuildChannel>;
        message_counter_user_stats: MessageCounterUserStats;
        message_counter_user_stats_guilds_channels_composite: Knex.CompositeTableType<MessageCounterUserStats>;
        auto_purge_messages: AutoPurgeMessage;
        auto_purge_messages_composite: Knex.CompositeTableType<AutoPurgeMessage>;
        auto_purge_settings: AutoPurgeSettings;
        auto_purge_settings_composite: Knex.CompositeTableType<AutoPurgeSettings>;
    }
}