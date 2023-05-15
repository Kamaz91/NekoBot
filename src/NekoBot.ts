import logger from '@includes/logger';

logger.info('Starting...');
logger.info('*****************************');
logger.info('*       NekoBot v12.0       *');
logger.info('*****************************');

import { login } from '@core/Bot';

login();