module.exports = {
  apps: {
    name: "tracer",
    script: "./dist/app.js",
    env: {
      "NODE_ENV": "production",
      "INTERNAL_API_ENDPOINT": "http://172.31.41.89:8081",  // ip of rest API (internal IP only)
      "DB_HOST": "13.112.235.77",
      "DB_USER": "gsicbo",
      "DB_PWD": "gsb1@Agg",
      "DB_NAME": "gsicbo",
      "MGR_PK": "",  // should be filled with tazgamingmgr private key
      "CHAIN_RPC_GROUP": 1,  // 0: test rpc group, 1: mainnet rpc group
      "START_BLOCK": 0,  // 0:from the current head, any number: from the written block
      "NODE_TLS_REJECT_UNAUTHORIZED": "1",

    }
  }
}
