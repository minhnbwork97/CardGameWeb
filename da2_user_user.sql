-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: localhost    Database: da2_user
-- ------------------------------------------------------
-- Server version	5.7.20-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `Username` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Money` int(11) NOT NULL DEFAULT '5000',
  `Avatar` varchar(255) NOT NULL DEFAULT '/img/Avatar/default.jpg',
  `Gifted` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`Username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('ABC','123',210140,'/img/Avatar/default.jpg',0),('ChauTinhTri','56452',500000,'/img/Avatar/default.jpg',0),('DoThanh','123456789',250000,'/img/Avatar/default.jpg',0),('NgonPhi','45321qwert',600000,'/img/Avatar/default.jpg',0),('QuanVanTruong','lalskdjmnxc',100000,'/img/Avatar/default.jpg',0),('abc','123',804400,'/img/Avatar/default.jpg',0),('da2','123',5000,'/img/Avatar/default.jpg',0),('def','123',5480,'/img/Avatar/default.jpg',0),('taikhoan1','abcd',7230,'/img/Avatar/default.jpg',0),('taikhoan123','123',205200,'/img/Avatar/default.jpg',0),('taikhoan2','alksjhdajksc',7220,'/img/Avatar/default.jpg',0),('taikhoan3','wio74wihgj',6400,'/img/Avatar/default.jpg',0),('taikhoan4','abczyx',5000,'/img/Avatar/default.jpg',0);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-02-01  0:03:15
