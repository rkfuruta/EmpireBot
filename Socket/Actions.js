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
const Item = require("../Model/Item.js");

module.exports = {
    new_item: (data) => {
        _.each(data, (item) => {
            let item_model = new Item(item);
            Bid.execute(item_model);
        });
    }
}