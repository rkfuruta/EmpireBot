const _ = require("underscore");
const wear = require("../Item/Wear.js");
const config = require("../config.json");
const Message = require("../Model/Message.js");
const Price = require("../Model/Price.js");
const axios = require("axios");
const constants = require('../constants.json');
const price = new Price();

axios.defaults.headers.common['Authorization'] = `Bearer ${config.empire.api_key}`;

module.exports = {
    execute: async (item) => {
        if (config.bid.check_blacklist && item.isOnBlackList()) {
            Message.debug(`${item.name} removed: Blacklist`, "warning", "bad_item");
            return false;
        }
        if (config.bid.min_value > item.price) {
            Message.debug(`${item.name} removed: Min value: ${config.bid.min_value} Item price:${item.price}`, "error", "bad_item");
            return false;
        }
        if (config.bid.max_value < item.price) {
            Message.debug(`${item.name} removed: Max value: ${config.bid.max_value} Item price:${item.price}`, "error", "bad_item");
            return false;
        }
        if (module.exports.isExcludedWear(item)) {
            Message.debug(`${item.name} removed: Wear type`, "error", "bad_item");
            return false;
        }
        if (!config.bid.buy_commodity && item.is_commodity) {
            Message.debug(`${item.name} removed: Is commodity`, "error", "bad_item");
            return false;
        }
        if (!config.bid.buy_no_paint_items && item.wear === null) {
            Message.debug(`${item.name} removed: Has no wear`, "error", "bad_item");
            return false;
        }
        if (!config.bid.buy_stattrack && item.isStatTrack()) {
            Message.debug(`${item.name} removed: StatTrack`, "error", "bad_item");
            return false;
        }
        if (!config.bid.buy_knife_glove && item.isKnifeorGlove()) {
            Message.debug(`${item.name} removed: Knife or Glove`, "error", "bad_item");
            return false;
        }
        if (!(await price.hasGoodPrice(item))) {
            Message.debug(`${item.name} removed: Bad Price`, "error", "bad_item");
            return false;
        }
        if (config.bid.validate_float && !item.hasGoodFloat()) {
            Message.debug(`${item.name} removed: Bad float ${item.wear}`, "error", "bad_item");
            return false;
        }

        return await module.exports.place(item);
    },

    isExcludedWear: (item) => {
        let item_wear = wear.getWear(item.wear);
        let exclude = false;
        _.each(config.bid.filter_by_wear, (type) => {
            if (type === item_wear) {
                exclude = true;
            }
        });
        return exclude;
    },

    place: async (item) => {
        Message.print(`Place Bid on \n\tName: ${item.name}\n\tWear: ${item.wear}\n\tCoins: ${item.value}\n\tPrice: ${item.getFormattedPrice()}\n\tBid Value: ${item.bid_value}\n\tBid Price: ${item.getFormattedBidPrice()}`, "success");
        let url = `${constants.empire.endpoint}trading/deposit/${item.depositId}/bid`;
        Message.debug(url, "blue");
        Message.debug(`Item: ${item.name} Url: ${url} Bid value: ${item.bid_value}`, "warning");
        if (config.bid.enabled) {
            Message.print("Placing bid", "warning");
            await axios.post(url, {bid_value: item.bid_value}).catch((err) => {
                if (err.hasOwnProperty("response") && err.response.hasOwnProperty("data") && err.response.data.hasOwnProperty("message")) {
                    Message.print(err.response.data.message, "error")
                } else {
                    Message.debug(err, "exception");
                }
                return null;
            });
            return item;
        }
        return null;
    }
}