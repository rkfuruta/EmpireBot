const axios = require('axios');
const Message = require("../Model/Message");
const moment = require("moment");
const config = require("../config.json");
const _ = require("underscore");
const itemList = {};

module.exports = class Waxpeer {
    async getPrice(item) {
        if(!item) {
            return null;
        }
        return await this.getBuyOrder(item);
    }

    async getBuyOrder(item) {
        if (itemList.hasOwnProperty(item.name)) {
            let cache = moment().subtract(config.waxpeer.cacheList, 'minutes');
            if (itemList[item.name].time.isBefore(cache)) {
                Message.debug(`Item list refresh from ${item.name} - ${config.waxpeer.cacheList} minutes`, "blue");
                delete itemList[item.name];
                return this.getBuyOrder(item);
            }
            Message.debug(`Item price from cache ${item.name}`, "blue");
            return itemList[item.name].price;
        }
        Message.debug("Get item buy order from Waxpeer", "blue");
        let url = `https://api.waxpeer.com/v1/buy-orders?game=csgo&api=${config.waxpeer.apiKey}&name=${encodeURI(item.name)}`;
        let request = await axios.get(url).catch((err) => {
            Message.debug(err, "exeption");
        });
        let list = request.data.offers;
        if (!list || !list.length) {
            return null;
        }
        let bestOrder = list.shift();
        let secondOrder = list.shift();
        let best = parseInt(bestOrder.price);
        if (secondOrder !== undefined) {
            let best = parseInt(bestOrder.price);
            let second = parseInt(secondOrder.price);
            let percentage = 100-((second*100)/best);
            Message.debug(`Checking buy order price: highest: ${best} second: ${second} percentage: ${percentage}%`, "blue");
            if (percentage > config.waxpeer.buyOrderCheckPercentage) {
                Message.debug(`Price from highest buy order has more than ${config.waxpeer.buyOrderCheckPercentage}% diff from second`, "warning");
                return null;
            }
        }
        itemList[item.name] = {
            "time": moment(),
            "price": this.convertPriceToDollar(best)
        };
        return itemList[item.name].price;
    }

    convertPriceToDollar(price) {
        return price/1000;
    }

    async getItemList() {
        if (!this.itemList) {
            Message.debug("Get item list from Waxpeer", "blue");
            let url = `https://api.waxpeer.com/v1/prices?game=csgo`;
            let request = await axios.get(url).catch((err) => {
                Message.debug(err, "exeption");
            });
            this.itemList = {
                "time": moment(),
                "list": request.data.items
                }
        } else {
            let cache = moment().subtract(config.waxpeer.cacheList, 'minutes');
            if (this.itemList.time.isBefore(cache)) {
                Message.debug(`Item list refresh ${config.waxpeer.cacheList} minutes`, "blue");
                this.itemList = null;
                return this.getItemList();
            }
        }
        return this.itemList.list;
    }
}