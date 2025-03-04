import { QuoteTemplate } from "./quotes";

type TokenType = "discord" | "lastfm_api";
type LogsType = "message_delete" | "voice_change" | "guild_left";

interface ModuleSettings {
  id: number;
  guild_id: string;
  enabled: boolean;
  module_name: String;
  edited_timestamp: number;
}
interface ApiTokens {
  token: string;
  token_type: TokenType;
}
interface User {
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

interface Guild {
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

interface GuildChannel {
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

interface GuildMember {
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

interface AutoPurgeSettings {
  id: number;
  guild_id: string;
  channel_id: string;
  older_than: number;
}

interface AutoPurgeMessage {
  guild_id: string;
  channel_id: string;
  message_id: string;
  create_timestamp: number;
}

interface MessageCounterSettings {
  enabled: boolean;
  guild_id: string;
  is_hidden: boolean;
  bots: boolean;
  listing: "all" | "whitelist" | "blacklist";
}

interface MessageCounterChannelList {
  guild_id: string;
  channel_id: string;
}

interface MessageCounterUserStats {
  user_id: string;
  guild_id: string;
  total_messages: number;
  total_words: number;
  total_chars: number;
  total_attachments: number;
  last_message_timestamp: number;
  created_timestamp: number;
}

interface NotifierChannels {
  channel_id: string;
  guild_id: string;
  type: LogsType;
  modified_timestamp: number;
  created_timestamp: number;
}

interface NotifierUsersDM {
  user_id: string;
  guild_id: string;
  type: LogsType;
  enabled: boolean;
  created_timestamp: number;
}

interface Quote {
  id: number;
  quote_guild_position: number;
  user_id: string;
  guild_id: string;
  text: string;
  created_timestamp: number;
  data: QuoteTemplate;
  hidden: boolean;
}

interface LinkChangerSettings {
  id: number;
  guild_id: string;
  type: "reply" | "delete";
  remove_text: boolean
  domain: string;
  domain_change_to: string;
  check_embed: boolean;
  tld: string;
  tld_change_to: string;
  bots: boolean;
  on: boolean;
}