-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Wersja serwera:               8.0.16 - MySQL Community Server - GPL
-- Serwer OS:                    Win64
-- HeidiSQL Wersja:              10.1.0.5464
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Zrzut struktury bazy danych nekobot
CREATE DATABASE IF NOT EXISTS `nekobot` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `nekobot`;

-- Zrzut struktury tabela nekobot.guilds
CREATE TABLE IF NOT EXISTS `guilds` (
  `guildId` text NOT NULL,
  `guildName` text NOT NULL,
  `guildCreateTime` text NOT NULL,
  `guildOwnerId` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.
-- Zrzut struktury tabela nekobot.message_counter
CREATE TABLE IF NOT EXISTS `message_counter` (
  `guild_id` text NOT NULL,
  `user_id` text NOT NULL,
  `0` int(10) unsigned DEFAULT '0',
  `1` int(10) unsigned DEFAULT '0',
  `2` int(10) unsigned DEFAULT '0',
  `3` int(10) unsigned DEFAULT '0',
  `4` int(10) unsigned DEFAULT '0',
  `5` int(10) unsigned DEFAULT '0',
  `6` int(10) unsigned DEFAULT '0',
  `7` int(10) unsigned DEFAULT '0',
  `8` int(10) unsigned DEFAULT '0',
  `9` int(10) unsigned DEFAULT '0',
  `10` int(10) unsigned DEFAULT '0',
  `11` int(10) unsigned DEFAULT '0',
  `12` int(10) unsigned DEFAULT '0',
  `13` int(10) unsigned DEFAULT '0',
  `14` int(10) unsigned DEFAULT '0',
  `15` int(10) unsigned DEFAULT '0',
  `16` int(10) unsigned DEFAULT '0',
  `17` int(10) unsigned DEFAULT '0',
  `18` int(10) unsigned DEFAULT '0',
  `19` int(10) unsigned DEFAULT '0',
  `20` int(10) unsigned DEFAULT '0',
  `21` int(10) unsigned DEFAULT '0',
  `22` int(10) unsigned DEFAULT '0',
  `23` int(10) unsigned DEFAULT '0',
  `ymd` int(10) unsigned NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.
-- Zrzut struktury tabela nekobot.presenceupdate
CREATE TABLE IF NOT EXISTS `presenceupdate` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` text NOT NULL,
  `guildId` text NOT NULL,
  `status` text NOT NULL COMMENT 'offline:0,online:1,idle:2,dnd:3',
  `ostatus` text COMMENT 'last status',
  `gameId` text,
  `gameName` text,
  `gameState` text,
  `gameDetails` text,
  `gameStart` bigint(20) unsigned DEFAULT NULL,
  `gameEnd` bigint(20) unsigned DEFAULT NULL,
  `timestamp` bigint(20) unsigned NOT NULL,
  `nmom` tinyint(4) unsigned NOT NULL COMMENT 'newmember/oldmember data',
  `hide` tinyint(3) unsigned NOT NULL DEFAULT '0' COMMENT 'flag for hide this data nm: 1 om: 2',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1356 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.
-- Zrzut struktury tabela nekobot.quotes
CREATE TABLE IF NOT EXISTS `quotes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quoteIdByGuild` int(11) NOT NULL,
  `autorId` text,
  `autorName` text,
  `guildId` text,
  `guildName` text,
  `text` text,
  `timestamp` bigint(6) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
