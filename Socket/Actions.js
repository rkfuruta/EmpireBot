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
const moment = require("moment/moment");
const Message = require("../Model/Message");
let bidItems = {};

function clearOldBids() {
    _.each(Object.keys(bidItems), (id) => {
        const lifeTime = moment().subtract(30, 'minutes');
        if (bidItems[id].time.isBefore(lifeTime)) {
            const item = bidItems[id].item;
            Message.debug(`Deleted item ${item.name} from bid list`, "warning");
            delete bidItems[id];
        }
    });
}

module.exports = {
    new_item: (data) => {
        _.each(data, async (item) => {
            let item_model = new Item(item);
            let result = await Bid.execute(item_model);
            if (result) {
                bidItems[item_model.depositId] = {
                    "item": item_model,
                    "time": moment()
                }
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
        clearOldBids();
    }
}