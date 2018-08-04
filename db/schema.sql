DROP TABLE IF EXISTS `blocks`;
CREATE TABLE `blocks` (
  `blockNumber` INT NOT NULL,
  `timeStamp`   INT NOT NULL,
  `blockHash`   CHAR(66) NOT NULL,
  PRIMARY KEY (`blockNumber`),
  INDEX k_timeStamp(`timeStamp`),
  INDEX k_blockHash(`blockHash`)
) ENGINE='InnoDB';

DROP TABLE IF EXISTS `txlist`;
CREATE TABLE `txlist` (
  `blockNumber` INT NOT NULL,
  `hash` CHAR(66) NOT NULL,
  `transactionIndex` INT NOT NULL,
  `nonce` INT NOT NULL,
  `from` CHAR(42) NOT NULL,
  `contractAddress` CHAR(42) NOT NULL DEFAULT '',
  `to` CHAR(42) NOT NULL,
  `value` CHAR(20) NOT NULL DEFAULT '',
  `gas` CHAR(20) NOT NULL DEFAULT '',
  `gasPrice` CHAR(20) NOT NULL DEFAULT '',
  `gasUsed` CHAR(20) NOT NULL DEFAULT '',
  `input` TEXT,
  PRIMARY KEY (`hash`),
  INDEX k_blockNumber(`blockNumber`),
  INDEX k_from(`from`),
  INDEX k_contractAddress(`contractAddress`),
  INDEX k_to(`to`)
) ENGINE='InnoDB';

DROP TABLE IF EXISTS `contract`;
CREATE TABLE `contract` (
  `contractAddress` CHAR(42) NOT NULL,
  `blockNumber`  INT NOT NULL,
  `tokenName`    CHAR(50) NULL,
  `tokenSymbol`  CHAR(10) NULL,
  `tokenDecimal` INT NULL,
  PRIMARY KEY (`contractAddress`),
  INDEX k_blockNumber(`blockNumber`),
  INDEX k_tokenSymbol(`tokenSymbol`)
) ENGINE='InnoDB';
