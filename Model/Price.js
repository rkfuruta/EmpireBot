const Steam = require("../Price/Steam");
const Waxpeer = require("../Price/Waxpeer");
const Message = require("../Model/Message.js");
const config = require("../config.json");


module.exports = class Price {
    constructor() {
        this.steam = new Steam();
        this.waxpeer = new Waxpeer();
    }
    async hasGoodPrice(item) {
        let price = await this.getPrice(item);
        Message.debug(`Item price: ${item.price} Buy order: ${price}` , "blue");
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

    async getPrice(item) {
        let price = await this.waxpeer.getPrice(item);
        // if (!price) {
        //     Message.debug(`Item price from steam: ${price}`, "blue");
        //     price = await this.steam.getPrice(item);
        // }
        return price;
    }
}