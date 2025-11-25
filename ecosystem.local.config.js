module.exports = {
  apps: [
    {
      name: 'chatbot-ui',
      script: '.next/standalone/server.js',
      cwd: './',
      instances: 2, // 或 'max' 使用所有 CPU 核心
      exec_mode: 'cluster', // 或 'cluster'，根据需要选择
      env: {
        DOTENV_CONFIG_PATH: ".env",
        PORT: 3000,
      },
    }
  ]
};