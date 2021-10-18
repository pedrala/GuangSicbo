module.exports = {
  apps: {
    name: "testtracer",
    script: "./dist/app.js",
    env: {
      "NODE_ENV": "production",
      "INTERNAL_API_ENDPOINT": "http://172.31.44.32:8081",  // ip of rest API (internal IP only)
      "DB_HOST": "13.112.235.77",
      "DB_USER": "gsicbo",
      "DB_PWD": "gsb1@Agg",
      "DB_NAME": "test",
      "MGR_PK": "5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3",  // test key
      "CHAIN_RPC_GROUP": 0,  // 0: test rpc group, 1: mainnet rpc group
      "START_BLOCK": 0,  // 0:from the current head, any number: from the written block
      "NODE_TLS_REJECT_UNAUTHORIZED": "1"
    }
  }
}
