"use strict";

module.exports = {
  apps: [{
    name: 'chatbot-ui',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: './',
    instances: 2,
    // 或 'max' 使用所有 CPU 核心
    exec_mode: 'cluster',
    // 或 'cluster'，根据需要选择
    env: {
      DOTENV_CONFIG_PATH: ".env",
      PORT: 3000
    }
  }]
};