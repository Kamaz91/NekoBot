import "./core/env.js";
import logger from './services/logger/index.js';

logger.info('Starting...');
logger.info(`Node.js version: ${process.version}`);
logger.info('*****************************');
logger.info('*      NekoBot v13.0.0      *');
logger.info('*****************************');

import { login } from './core/Bot.js';
login();