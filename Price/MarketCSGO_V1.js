const axios = require('axios');
const Message = require("../Model/Message");
const moment = require("moment");
const config = require("../config.json");
const _ = require("underscore");
let itemList = {};

module.exports = class MarketCSGO {
    constructor() {
        this.getItemList();
    }
    async getPrice(item) {
        if (!item) {
            return null;
        }
        const price = await this.getBuyOrder(item);
        if (!price) {
            return null;
        }
        return {
            "price" : price,
            "from": "MarketCSGO"
        };
    }

    async getBuyOrder(item) {
        if (!Object.keys(itemList).length) {
            await this.getItemList();
        }
        let cache = moment().subtract(config.marketcsgo.cacheList, 'minutes');
        if (itemList.time.isBefore(cache)) {
            Message.debug(`Refreshing itemList from MarketCSGO - ${config.marketcsgo.cacheList} minutes`, "blue");
            await this.getItemList();
        }
        if (itemList.items.hasOwnProperty(item.name)) {
            return itemList.items[item.name].price;
        }
        return null;
    }

    async getItemList() {
        Message.debug(`Sending request to get itemList from MarketCSGO`, "blue");
        itemList = {};
        let url = `https://market.csgo.com/api/v2/prices/class_instance/USD.json`;
        let request = await axios.get(url).catch((err) => {
            Message.debug(err, "exeption");
        });
        itemList = {
            "time": moment(),
            "items": {}
        }
        _.each(request.data.items, (item) => {
            if (itemList["items"].hasOwnProperty(item.market_hash_name)) {
                if (item.buy_order < itemList["items"][item.market_hash_name].price) {
                    itemList["items"][item.market_hash_name] = {
                        "price": item.buy_order,
                        "avg_price": item.avg_price,
                        "popularity": item.popularity_7d
                    }

                }
            } else {
                itemList["items"][item.market_hash_name] = {
                    "price": item.buy_order,
                    "avg_price": item.avg_price,
                    "popularity": item.popularity_7d
                }
            }
        });
        Message.debug(`itemList from MarketCSGO generated`, "blue");
    }
}