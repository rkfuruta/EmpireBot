/*
Events:
    timesync
    new_item
    updated_item
    auction_update
    deleted_item
    trade_status
 */
const _ = require("underscore");
const Bid = require("../Rules/Bid.js");
const Auction = require("../Rules/Auction.js");
const Item = require("../Model/Item.js");
let bidItems = {};

module.exports = {
    new_item: (data) => {
        _.each(data, async (item) => {
            let item_model = new Item(item);
            let result = await Bid.execute(item_model);
            if (result) {
                bidItems[item_model.depositId] = item_model;
            }
        });
    },

    auction_update: (data, userData) => {
        _.each(data, async(update) => {
            let auction = new Auction();
            let result = await auction.update(userData, update, bidItems);
            if (result && bidItems.hasOwnProperty(result)) {
                delete bidItems[result];
            }
        });
    }
}