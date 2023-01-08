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

module.exports = {
    new_item: (data) => {
        _.each(data, (item) => {
            console.log(item.market_name);
            // console.log(item);
            // console.log(item.name);
        });
    }
}