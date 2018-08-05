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
  `txreceipt_status` CHAR(10) NOT NULL DEFAULT '',
  `isError` CHAR(10) NOT NULL DEFAULT '0',
  PRIMARY KEY (`hash`),
  INDEX k_blockNumber(`blockNumber`),
  INDEX k_from(`from`),
  INDEX k_contractAddress(`contractAddress`),
  INDEX k_to(`to`)
) ENGINE='InnoDB';

-- tokentx: same as txlist, but it is used for token transfers only
-- only difference except contractAddress <> '', is that value represents amount of tokens,
-- and not ETH, sent to the contract address

DROP TABLE IF EXISTS `tokentx`;
CREATE TABLE `tokentx` (
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

DROP TABLE IF EXISTS `logs`;
CREATE TABLE `logs` (
  `address` CHAR(42) NOT NULL,
  `blockNumber`  INT NOT NULL,
  `hash`     CHAR(66) NOT NULL,
  `logIndex` INT NOT NULL,
  `topic0`       CHAR(66) NOT NULL DEFAULT '',
  `topic1`       CHAR(66) NOT NULL DEFAULT '',
  `topic2`       CHAR(66) NOT NULL DEFAULT '',
  `topic3`       CHAR(66) NOT NULL DEFAULT '',
  `data`     TEXT,
  PRIMARY KEY (`hash`, `logIndex`),
  INDEX k_address(`address`),
  INDEX k_blockNumber(`blockNumber`),
  INDEX k_topic0(`topic0`),
  INDEX k_topic1(`topic1`),
  INDEX k_topic2(`topic2`),
  INDEX k_topic3(`topic3`)
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
