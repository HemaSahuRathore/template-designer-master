module.exports = {
  transpileDependencies: ["vuetify", /ckeditor5-[^/\\]+[/\\]src[/\\].+\.js$/],
  devServer: {
    host: 'localhost',
    proxy: {
      "/api": {
        target: process.env.VUE_APP_BACKEND_BASE_URL,
        ws: true,
        changeOrigin: true,
      },
    }
  },
};
