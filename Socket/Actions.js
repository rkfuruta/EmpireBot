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
        _.each(data, (item) => {
            let item_model = new Item(item);
            let result = Bid.execute(item_model);
            if (result) {
                bidItems[item.depositId] = item;
            }
        });
    },

    auction_update: (data, userData) => {
        _.each(data, (update) => {
            let auction = new Auction();
            bidItems = auction.update(userData, update, bidItems);
        });
    }
}