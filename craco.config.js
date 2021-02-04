const path = require("path");

module.exports = {
    devServer: {
        // make linux os watch works
        watchOptions: {
            poll: true
        }
    },
    webpack: {
        alias: {
            "@": path.join(__dirname, "src"),
        }
    }
}