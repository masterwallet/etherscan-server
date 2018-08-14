# etherscan-server
EtherScan NodeJs Server - For Test Environments

# Purpose
This tool is designed to emulate some functions of EtherScap API - which is not available for test and local environments.

# Installation

```
git clone https://github.com/masterwallet/etherscan-server
cd etherscan-server
npm install
```
Current version requires MYSQL database as indexing persistent layer. So, before first launch,
please create `etherscan` database locally (`npm run init:db`) and install schema from `db` folder (`npm run init:schema`)

# Running
```
npm run start
```

# Disclaimer
This is early beta, should not be used for production yet
