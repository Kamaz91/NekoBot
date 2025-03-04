declare global {
    namespace NodeJS {
        interface ProcessEnv {
            // Database
            DB_NAME: string;
            DB_PASS: string;
            DB_HOST: string;
            DB_USER: string;
            DB_PORT: string;
            DB_CLIENT: string

            // API keys
            DISCORD_KEY: string;
            LASTFM_KEY: string;

            // Logging
            LOGS_DIR: string;
        }
    }
}

export { }