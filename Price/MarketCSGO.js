const axios = require('axios');
const Message = require("../Model/Message");
const _ = require("underscore");
const moment = require("moment/moment");
const config = require("../config.json");
const itemList = {};

module.exports = class MarketCSGO {
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
        if (itemList.hasOwnProperty(item.name)) {
            let cache = moment().subtract(config.marketcsgo.cacheList, 'minutes');
            if (itemList[item.name].time.isBefore(cache)) {
                Message.debug(`Item list refresh from ${item.name} - ${config.marketcsgo.cacheList} minutes`, "blue");
                delete itemList[item.name];
                return this.getBuyOrder(item);
            }
            Message.debug(`Item price from cache ${item.name}`, "blue");
            return itemList[item.name].price;
        }
        const url = `https://market.csgo.com/api/graphql`;
        let response = await axios.post(url, {
            "operationName": "orders",
            "variables": {
                "market_hash_name": item.name,
                "phase": ""
            },
            "query": "query orders($market_hash_name: String!, $phase: String!) {\n  orders(market_hash_name: $market_hash_name, phase: $phase) {\n    price\n    total\n    __typename\n  }\n}"
        }).catch((err) => {
            Message.debug(err, "exeption");
        });
        if (response.data.data.orders) {
            _.each(response.data.data.orders, (order) => {
                if (!itemList.hasOwnProperty(item.name)) {
                    order.time = moment();
                    itemList[item.name] = order;
                } else if (itemList[item.name].price < order.price) {
                    order.time = moment();
                    itemList[item.name] = order;
                }
            });
        } else if (response.data.data.orders === null) {
            itemList[item.name]= {
                "time": moment(),
                "price": null
            };
        }
        try {
            return itemList[item.name].price;
        } catch (e) {
            console.log(response.data);
            console.log(item.name)
        }
    }
}