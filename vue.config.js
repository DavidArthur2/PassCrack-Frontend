const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,

  devServer: {
    host: '0.0.0.0',
    port: 8000,
    allowedHosts: 'all',

    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      }
    },

    client: {
      webSocketURL: 'wss://allamv1.ms.sapientia.ro/ws'
    }
  }
});
