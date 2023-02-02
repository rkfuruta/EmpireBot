const Message = require("../Model/Message.js");
const Price = require("../Model/Price.js");
const Bid = require("../Rules/Bid.js");
const price = new Price();

module.exports = class AuctionUpdate {
    async update(userData, update, bidItems) {
        if (userData.user.id === update.auction_highest_bidder) {
            return null;
        }
        if (!bidItems.hasOwnProperty(update.id)) {
            return null;
        }
        let item = bidItems[update.id];
        let newBidValue = price.getNextBidValue(update.auction_highest_bid);
        Message.debug(`Checking update on auction ${item.name} Price(${item.raw_value}) Bid(${item.bid_value}) New Bid(${newBidValue})`, "blue");
        item.bid_value = newBidValue;
        if (price.checkAuctionUpdatePrice(item)) {
            Message.debug(`Placing new bid on item ${item.name}\n\tcoins: ${item.value}\n\tbid value: ${item.bid_value}\n\tbuy order from: ${item.item.buy_order.from}\n\tbuy order: ${item.item.buy_order.price}`, "warning")
            let response = await Bid.place(item);
            if (response) {
                return update.id;
            }
        } else {
            return update.id;
        }
        return null;
    }
}