const _ = require("underscore");
const config = require("../config.json");

const range = {
    "Factory New": {
        "from": 0,
        "to": 0.07,
    },
    "Minimal Wear": {
        "from": 0.07,
        "to": 0.15,
    },
    "Field-Tested": {
        "from": 0.15,
        "to": 0.38,
    },
    "Well-Worn": {
        "from": 0.38,
        "to": 0.45,
    },
    "Battle-Scarred": {
        "from": 0.45,
        "to": 1.00,
    }
}

module.exports = {
    getWear: (float) => {
        let result = "Factory New";
        _.each(Object.keys(range), (name) => {
            if (float > range[name].from && float <= range[name].to) {
                result = name;
            }
        });
        return result;
    },

    getGoodWear: (type) => {
        let base = range[type].to;
        let baseRange = range[type].to - range[type].from;
        let threshold = config.bid.wear_threshold;
        let type_range = (baseRange * threshold) / 100;
        return base - type_range;
    }
}