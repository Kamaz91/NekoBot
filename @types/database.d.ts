import { QuoteTemplate } from "./core";

type TokenType = "discord";
type LogsType = "message_delete" | "voice_change" | "guild_left";

export interface ModuleSettings {
  id: number;
  guild_id: string;
  enabled: boolean;
  module_name: String;
  edited_timestamp: number;
}
export interface ApiTokens {
  token: string;
  token_type: TokenType;
}
export interface User {
  id: number;
  user_id: string;
  username: string;
  avatar: string;
  discriminator: string;
  locale: string;
  discord_token: string;
  dtoken_type: string;
  token_expire: number;
  created_timestamp: number;
  modified_timestamp: number;
}

export interface Guild {
  id: number;
  guild_Id: string;
  name: string;
  region: string;
  iconURL: string;
  guild_bg: string;
  createdTimestamp: number;
  is_private: number;
  owner_Id: string;
}

export interface GuildChannel {
  id: number;
  channel_id: string;
  guild_id: string;
  parent_id: string;
  name: string;
  type: string;
  position: number;
  created_timestamp: number;
  updated_timestamp: number;
  created_at: number;
  is_deleted: number;
  is_hidden: number;
}

export interface GuildMember {
  guild_id: string;
  user_id: string;
  username: string;
  nickname: string;
  avatar: string;
  avatar_id: string;
  discriminator: string;
  is_bot: number;
  is_admin: number;
  is_vip: number;
  left: number;
  account_created_timestamp: number;
  leave_timestamp: number;
  joined_timestamp: number;
}

export interface AutoPurgeSettings {
  id: number;
  guild_id: string;
  channel_id: string;
  older_than: number;
}

export interface AutoPurgeMessage {
  guild_id: string;
  channel_id: string;
  message_id: string;
  create_timestamp: number;
}

export interface MessageCounterSettings {
  enabled: boolean;
  guild_id: string;
  is_hidden: boolean;
  bots: boolean;
  listing: "all" | "whitelist" | "blacklist";
}

export interface MessageCounterChannelList {
  guild_id: string;
  channel_id: string;
}

export interface MessageCounterUserStats {
  user_id: string;
  guild_id: string;
  total_messages: number;
  total_words: number;
  total_chars: number;
  total_attachments: number;
  last_message_timestamp: number;
  created_timestamp: number;
}

export interface NotifierChannels {
  channel_id: string;
  guild_id: string;
  type: LogsType;
  modified_timestamp: number;
  created_timestamp: number;
}

export interface NotifierUsersDM {
  user_id: string;
  guild_id: string;
  type: LogsType;
  enabled: boolean;
  created_timestamp: number;
}

export interface Quote {
  id: number;
  quote_guild_position: number;
  user_id: string;
  guild_id: string;
  text: string;
  created_timestamp: number;
  data: QuoteTemplate;
  hidden: boolean;
}