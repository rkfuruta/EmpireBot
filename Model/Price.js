const Steam = require("../Price/Steam");
const Waxpeer = require("../Price/Waxpeer");
const MarketCSGO = require("../Price/MarketCSGO");
const Message = require("../Model/Message.js");
const config = require("../config.json");
const _ = require("underscore");


module.exports = class Price {
    constructor() {
        this.steam = new Steam();
        this.waxpeer = new Waxpeer();
        this.marketcsgo = new MarketCSGO();
    }
    async hasGoodPrice(item) {
        let price = await this.getPrice(item);
        Message.debug(`Item ${item.name} Coin: ${item.price} Price: ${item.getFormattedPrice()} Buy order: ${price} Buy from: ${item.buy_order.from}` , "blue");
        if (!price) {
            return false;
        }
        if (item.price > price) {
            return false;
        }
        let percentage = 100-((item.price*100)/price);
        Message.debug(`Discounted ${percentage}% - Item(${item.price}) - Buy Order(${price})` , "warning");
        if (percentage < config.bid.discount) {
            Message.debug(`Bad price - Discount(${percentage}) - Config(${config.bid.discount})` , "blue");
            return false;
        }
        return true;
    }

    checkAuctionUpdatePrice(item) {
        if (!item.buy_order || !item.buy_order.price) {
            Message.debug("Missing item buy order");
            return false;
        }
        if (item.buy_order.price < item.getBidPrice()) {
            Message.debug(`Auction item ${item.name} bid value (${item.bid_value}) bid price (${item.getBidPrice()}) higher than buy order (${item.buy_order.price})`)
            return false;
        }
        let percentage = 100-((item.price*100)/item.getBidPrice());
        Message.debug(`Discounted ${percentage}% - Item(${item.price}) - Buy Order(${item.buy_order.price}) - Bid Value (${item.bid_value})` , "warning");
        if (percentage < config.bid.discount) {
            Message.debug(`Bad price - Discount(${percentage}) - Config(${config.bid.discount})` , "blue");
            return false;
        }
        return true;
    }

    getNextBidValue(price) {
        let amount = price/100;
        return Math.round(price + amount);
    }

    async getPrice(item) {
        let price = null;
        let priority = [...config.price.priority];
        while(!price && priority.length) {
            let type = priority.shift().toLowerCase();
            if (this.hasOwnProperty(type)) {
                price = await this[type].getPrice(item);
            }
        }
        if (!price) {
            return null;
        }
        item.buy_order = price;
        return price.price;
    }
}