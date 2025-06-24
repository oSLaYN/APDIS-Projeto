-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.32-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for apdis
DROP DATABASE IF EXISTS `apdis`;
CREATE DATABASE IF NOT EXISTS `apdis` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `apdis`;

-- Dumping structure for table apdis.documents
DROP TABLE IF EXISTS `documents`;
CREATE TABLE IF NOT EXISTS `documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `description` text NOT NULL,
  `requested` int(11) NOT NULL,
  `accepted` int(11) DEFAULT NULL,
  `documentName` text DEFAULT NULL,
  `documentDOI` text DEFAULT NULL,
  `documentData` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table apdis.documents: ~4 rows (approximately)
DELETE FROM `documents`;
INSERT INTO `documents` (`id`, `description`, `requested`, `accepted`, `documentName`, `documentDOI`, `documentData`) VALUES
	(7, 'ATUM', 37, NULL, NULL, NULL, NULL);
INSERT INTO `documents` (`id`, `description`, `requested`, `accepted`, `documentName`, `documentDOI`, `documentData`) VALUES
	(8, 'Batatinha Doce', 37, NULL, NULL, NULL, NULL);
INSERT INTO `documents` (`id`, `description`, `requested`, `accepted`, `documentName`, `documentDOI`, `documentData`) VALUES
	(15, 'pediatria - artur jorge', 1234, NULL, NULL, NULL, NULL);
INSERT INTO `documents` (`id`, `description`, `requested`, `accepted`, `documentName`, `documentDOI`, `documentData`) VALUES
	(16, 'ASDASD', 1234, NULL, NULL, NULL, NULL);

-- Dumping structure for table apdis.logs
DROP TABLE IF EXISTS `logs`;
CREATE TABLE IF NOT EXISTS `logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `description` longtext NOT NULL,
  `moment` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table apdis.logs: ~28 rows (approximately)
DELETE FROM `logs`;
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(35, 'Atum é giro', '2025-06-17 11:01:56');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(36, 'Administrador Rodrigo Paiva Reverteu o Pedido Nº16.', '2025-06-23 12:04:01');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(37, 'Administrador Rodrigo Paiva Reverteu o Pedido Nº7.', '2025-06-23 12:04:02');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(38, 'Administrador Rodrigo Paiva Reverteu o Pedido Nº8.', '2025-06-23 12:04:45');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(39, 'Administrador Rodrigo Paiva Reverteu o Pedido Nº15.', '2025-06-23 12:05:03');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(40, 'Administrador Rodrigo Paiva Reverteu o Pedido Nº16.', '2025-06-23 12:06:54');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(41, 'Administrador Rodrigo Paiva Reverteu o Pedido Nº16.', '2025-06-23 12:09:02');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(42, 'Administrador Rodrigo Paiva Reverteu o Pedido Nº16.', '2025-06-23 12:09:36');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(43, 'Rodrigo Paiva Aceitou o Pedido Nº16', '2025-06-23 12:10:57');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(44, 'Rodrigo Paiva Aceitou o Pedido Nº8', '2025-06-23 12:11:38');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(45, 'Administrador Rodrigo Paiva Rejeitou o Registo Nº50 do Associado Fernando Medina Nº52.', '2025-06-23 19:36:50');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(46, 'Administrador Rodrigo Paiva Rejeitou o Registo Nº51 do Associado Fernando Medina Nº52.', '2025-06-23 19:36:54');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(47, 'Administrador Rodrigo Paiva Rejeitou o Registo Nº52 do Associado Fernando Medina Nº52.', '2025-06-23 19:36:56');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(48, 'Administrador Rodrigo Paiva Rejeitou o Registo Nº53 do Associado Fernando Medina Nº52.', '2025-06-23 19:36:59');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(49, 'Administrador Rodrigo Paiva Rejeitou o Registo Nº54 do Associado Fernando Medina Nº52.', '2025-06-23 19:37:01');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(50, 'Administrador Rodrigo Paiva Rejeitou o Registo Nº55 do Associado Fernando Medina Nº52.', '2025-06-23 19:37:03');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(51, 'Administrador Rodrigo Paiva Rejeitou o Registo Nº56 do Associado Fernando Medina Nº52.', '2025-06-23 19:37:04');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(52, 'Administrador Rodrigo Paiva Rejeitou o Registo Nº57 do Associado Fernando Medina Nº52.', '2025-06-23 19:37:11');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(53, 'Administrador Rodrigo Paiva Rejeitou o Registo Nº58 do Associado Fernando Medina Nº52.', '2025-06-23 19:37:13');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(54, 'Administrador Rodrigo Paiva Rejeitou o Registo Nº59 do Associado Fernando Medina Nº52.', '2025-06-23 19:37:14');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(55, 'Administrador Rodrigo Paiva Rejeitou o Registo Nº59 do Associado Fernando Medina Nº52.', '2025-06-23 19:47:05');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(56, 'Administrador Rodrigo Paiva Rejeitou o Registo Nº60 do Associado Fernando Medina Nº52.', '2025-06-23 19:47:07');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(57, 'Administrador Rodrigo Paiva Reverteu o Pedido Nº8.', '2025-06-23 19:50:03');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(58, 'Administrador Rodrigo Paiva Reverteu o Pedido Nº16.', '2025-06-23 19:50:04');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(59, 'Rodrigo Paiva Nº37 Fez um Pedido de Recuperação de Password.', '2025-06-24 10:00:33');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(60, 'Rodrigo Paiva Nº37 Fez um Pedido de Recuperação de Password.', '2025-06-24 10:03:31');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(61, 'Rodrigo Paiva Nº37 Fez um Pedido de Recuperação de Password.', '2025-06-24 10:03:32');
INSERT INTO `logs` (`id`, `description`, `moment`) VALUES
	(62, 'Rodrigo Paiva Nº37 Fez um Pedido de Recuperação de Password.', '2025-06-24 10:04:02');

-- Dumping structure for table apdis.requests
DROP TABLE IF EXISTS `requests`;
CREATE TABLE IF NOT EXISTS `requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `number` int(11) NOT NULL,
  `fullname` text NOT NULL,
  `email` text NOT NULL,
  `unit` text NOT NULL,
  `position` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table apdis.requests: ~0 rows (approximately)
DELETE FROM `requests`;

-- Dumping structure for table apdis.users
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `number` int(11) NOT NULL,
  `fullname` text NOT NULL,
  `email` text NOT NULL,
  `password` longtext DEFAULT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'user',
  `ip` tinytext DEFAULT NULL,
  `resettoken` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table apdis.users: ~0 rows (approximately)
DELETE FROM `users`;
INSERT INTO `users` (`id`, `number`, `fullname`, `email`, `password`, `type`, `ip`, `resettoken`) VALUES
	(4, 37, 'Rodrigo Paiva', 'rodrigo.paiva.calado@gmail.com', '$2b$12$61zIBVZVCQ38YVaS66Q3je7FIj3jCjeK59bHn81s0CKRlUxHT7vi.', 'superadmin', '193.137.97.165', '63KQ9DN6');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
