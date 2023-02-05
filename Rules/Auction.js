const Message = require("../Model/Message.js");
const Price = require("../Model/Price.js");
const Bid = require("../Rules/Bid.js");
const price = new Price();

module.exports = class AuctionUpdate {
    async update(userData, update, bidItems) {
        if (!bidItems.hasOwnProperty(update.id)) {
            return null;
        }
        let item = bidItems[update.id].item;
        if (userData.user.id === update.auction_highest_bidder) {
            Message.debug(`Currently highest bidder on ${item.name} Price(${item.raw_value}) Bid(${item.bid_value})`, `warning`)
            return null;
        }
        let newBidValue = price.getNextBidValue(update.auction_highest_bid);
        Message.debug(`Checking update on auction ${item.name} Price(${item.raw_value}) Bid(${item.bid_value}) New Bid(${newBidValue})`, "warning");
        item.bid_value = newBidValue;
        if (price.checkAuctionUpdatePrice(item)) {
            Message.debug(`Placing new bid on item ${item.name}\n\tcoins: ${item.value}\n\tbid value: ${item.bid_value}\n\tbuy order from: ${item.buy_order.from}\n\tbuy order: ${item.buy_order.price}`, "warning")
            await Bid.place(item);
        } else {
            return update.id;
        }
        return null;
    }
}