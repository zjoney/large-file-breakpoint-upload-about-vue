module.exports = {
    lintOnSave: false,
    devServer: {
        proxy: {
            '/': {
                target: 'http://127.0.0.1:8888',
                changeOrigin: true
            }
        }
    }
};