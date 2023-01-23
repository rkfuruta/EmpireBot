const config = require("../config.json");
const colors = require("colors");
const _ = require("underscore");

module.exports = {
    print: (message, type, identifier = null) => {
        if (identifier && config.print.hasOwnProperty(identifier) && !config.print[identifier]) {
            return false;
        }
        if (!_.isObject(message)) {
            switch (type) {
                case "exeption":
                    message = message.underline.red;
                    break;
                case "warning":
                    message = message.yellow;
                    break;
                case "error":
                    message = message.red;
                    break;
                case "success":
                    message = message.green;
                    break;
                case "blue":
                    message = message.blue;
                    break;
            }
        }
        console.log(message);
    },

    debug: (message, type, identifier = null) => {
        if (config.debug) {
            module.exports.print(message, type, identifier);
        }
    }
}