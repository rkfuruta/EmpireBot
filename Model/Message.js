const config = require("../config.json");

module.exports = {
    print: (message, type) => {
        console.log(message);
    },

    debug: (message, type) => {
        if (config.debug) {
            module.exports.print(message);
        }
    }
}