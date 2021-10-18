module.exports = {
  apps: {
    name: "server",
    script: "./dist/app.js",
    env: {
      "NODE_ENV": "production",
      "API_PORT": 8081,
      "TRACER_IP": "::ffff:172.31.36.58",  // tracer EC2's IP
      "LOCALHOST_IP": "::1",
      "DB_HOST": "13.112.235.77",
      "DB_USER": "gsicbo",
      "DB_PWD": "gsb1@Agg",
      "DB_NAME": "gsicbo",
      "MGR_PK": "",  // should be inserted (tazgamingmgr private key)
      "CHAIN_RPC": "https://mainnet.meet.one",
      "NODE_TLS_REJECT_UNAUTHORIZED": "1"
    }
  }
}
