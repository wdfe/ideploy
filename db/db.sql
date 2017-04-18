-- MySQL dump 10.13  Distrib 5.6.22, for osx10.8 (x86_64)
--
-- Host: localhost    Database: wdfe_publish
-- ------------------------------------------------------
-- Server version	5.6.22

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
-- Table structure for table `cperson`
--

DROP TABLE IF EXISTS `cperson`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cperson` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL COMMENT 'charge person name unique',
  `add_time` varchar(20) DEFAULT NULL COMMENT 'add_time timestamp',
  `status` varchar(10) DEFAULT '0' COMMENT 'status',
  `email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `history`
--

DROP TABLE IF EXISTS `history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) unsigned NOT NULL,
  `user` varchar(50) DEFAULT NULL COMMENT 'creater',
  `ip` varchar(40) DEFAULT NULL COMMENT 'ip suit for ipv6',
  `pub_time` varchar(20) DEFAULT NULL COMMENT 'publish time eg:1452854398154',
  `pub_desc` varchar(2000) DEFAULT NULL COMMENT 'publish desc',
  `tag` varchar(15) DEFAULT NULL COMMENT 'eg:2016011500279',
  `build_log` varchar(2083) DEFAULT NULL COMMENT 'build_log',
  `deploy_log` varchar(2083) DEFAULT NULL COMMENT 'deploy_log',
  `status` varchar(10) DEFAULT '0',
  `machine_id` int(11) unsigned NOT NULL,
  `type` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=133 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `machine`
--

DROP TABLE IF EXISTS `machine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `machine` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT 'machin name',
  `ip` varchar(40) DEFAULT NULL COMMENT 'ip suit for ipv6',
  `ssh_user` varchar(30) DEFAULT NULL COMMENT 'ssh_user',
  `ssh_pass` varchar(30) DEFAULT NULL COMMENT 'ssh_pass',
  `dir` varchar(1000) DEFAULT NULL,
  `sdir` varchar(1000) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `task` varchar(45) DEFAULT NULL,
  `type` int(11) unsigned NOT NULL,
  `lock_user` varchar(30) DEFAULT NULL COMMENT 'lock_user',
  `is_lock` int(11) DEFAULT '0',
  `op_env_id` int(11) DEFAULT '0' COMMENT 'op_env_id',
  `server_dir` varchar(1000) DEFAULT NULL,
  `after_deploy_shell` varchar(1000) DEFAULT NULL,
  `before_deploy_shell` varchar(1000) DEFAULT NULL,
  `deploy_hook` varchar(1000) DEFAULT NULL,
  `hook_params` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project`
--

DROP TABLE IF EXISTS `project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL COMMENT 'project name unique',
  `creater` varchar(50) DEFAULT NULL COMMENT 'creater',
  `vcs_type` tinyint(3) unsigned NOT NULL DEFAULT '0' COMMENT 'vcs type 0:svn 1.git , default svn',
  `code_url` varchar(2083) DEFAULT NULL COMMENT 'code url',
  `build_type` tinyint(3) unsigned DEFAULT '0' COMMENT 'build type :grunt gulp ... defalut grunt',
  `online_tag` varchar(20) DEFAULT NULL COMMENT 'online tag. eg:2016010800203',
  `last_tag` varchar(20) DEFAULT NULL COMMENT 'last tag. eg:2015122800202',
  `pub_time` varchar(20) DEFAULT NULL COMMENT 'pub_time timestamp',
  `status` varchar(10) DEFAULT '0' COMMENT 'status',
  `op_item_id` int(11) DEFAULT '0' COMMENT 'op_item_id',
  `op_item_name` varchar(10) DEFAULT '0' COMMENT 'op_item_name',
  `code_lang` varchar(50) DEFAULT 'javascript',
  `hook_params` varchar(1000) DEFAULT NULL,
  `deploy_hook` varchar(1000) DEFAULT NULL,
  `build_hook` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pub_machines`
--

DROP TABLE IF EXISTS `pub_machines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pub_machines` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mid` int(11) NOT NULL,
  `pid` int(11) NOT NULL,
  `ip` varchar(40) DEFAULT NULL COMMENT 'ip suit for ipv6',
  `dir` varchar(512) DEFAULT NULL COMMENT 'dist dir',
  `sdir` varchar(512) DEFAULT NULL COMMENT 'source dir',
  `ssh_user` varchar(30) DEFAULT NULL COMMENT 'ssh_user',
  `ssh_pass` varchar(30) DEFAULT NULL COMMENT 'ssh_pass',
  `type` tinyint(3) unsigned NOT NULL DEFAULT '2' COMMENT 'machine type 0:pro 1:pre 2:test',
  `task_name` varchar(30) DEFAULT NULL COMMENT 'build task name. eg: test9',
  PRIMARY KEY (`id`),
  KEY `mid` (`mid`),
  CONSTRAINT `pub_machines_ibfk_1` FOREIGN KEY (`mid`) REFERENCES `machine` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL COMMENT 'creater max length 30 character & unique',
  `pass` varchar(30) DEFAULT NULL COMMENT 'pass max length 30 character',
  `avatar` varchar(512) DEFAULT NULL COMMENT 'avatar',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-02-23 23:58:18
