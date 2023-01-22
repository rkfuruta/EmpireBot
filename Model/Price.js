const Steam = require("../Price/Steam");
const Message = require("../Model/Message.js");

module.exports = {
    hasGoodPrice: async (item) => {
        let price = module.exports.getPrice(item);
        console.log(price);
        return true;
    },

    getPrice: async (item) => {
        let steam = new Steam(item);
        let price = await steam.getPrice();
        Message.debug(`Item price from Steam: ${price}`);
        return price;
    }
}