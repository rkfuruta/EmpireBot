const _ = require("underscore");
const wear = require("../Item/Wear.js");
const config = require("../config.json");
const Message = require("../Model/Message.js");
const Price = require("../Model/Price.js");
const price = new Price();

module.exports = {
    execute: async (item) => {
        if (module.exports.isExcludedWear(item)) {
            Message.debug(`${item.name} removed: Wear type`, "error");
            return false;
        }
        if (!config.bid.buy_commodity && item.is_commodity) {
            Message.debug(`${item.name} removed: Is commodity`, "error");
            return false;
        }
        if (!config.bid.buy_no_paint_items && item.wear === null) {
            Message.debug(`${item.name} removed: Has no wear`, "error");
            return false;
        }
        if (!config.bid.buy_stattrack && item.isStatTrack()) {
            Message.debug(`${item.name} removed: StatTrack`, "error");
            return false;
        }
        if (!config.bid.buy_knife_glove && item.isKnifeorGlove()) {
            Message.debug(`${item.name} removed: Knife or Glove`, "error");
            return false;
        }
        if (!(await price.hasGoodPrice(item))) {
            Message.debug(`${item.name} removed: Bad Price`, "error");
            return false;
        }
        // if (!item.hasGoodFloat()) {
        //     Message.debug(`${item.name} removed: Bad float ${item.wear}`, "error");
        //     return false;
        // }
        module.exports.place(item);
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

    place: (item) => {
        Message.print(`Place Bid on \n\tName: ${item.name}\n\tWear: ${item.wear}\n\tCoins: ${item.value}\n\tPrice: ${item.getFormatedPrice()}`, "success");
    }
}