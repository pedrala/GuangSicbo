module.exports = {
  apps: {
    name: "testserver",
    script: "./dist/app.js",
    env: {
      "NODE_ENV": "production",
      "API_PORT": 8081,
      "TRACER_IP": "::ffff:172.31.36.58",  // tracer EC2's IP
      "LOCALHOST_IP": "::1",
      "DB_HOST": "13.112.235.77",
      "DB_USER": "gsicbo",
      "DB_PWD": "gsb1@Agg",
      "DB_NAME": "test",
      "MGR_PK": "5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3",  // test key
      "CHAIN_RPC": "https://nodeos.guang.game",  // test chain
      "NODE_TLS_REJECT_UNAUTHORIZED": "1"
    }
  }
}
