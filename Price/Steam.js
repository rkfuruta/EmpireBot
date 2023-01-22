const fs = require('fs');
const axios = require('axios');
const constants = require("../constants.json");
const Message = require("../Model/Message.js");

module.exports = class Steam {
    constructor(item) {
        this.item = item;
    }

    async getPrice() {
        if(!this.item) {
            return null;
        }
        let SteamItemId = await this.getSteamItemId();
        return await this.getBuyOrderPrice(SteamItemId);
    }

    async getBuyOrderPrice(itemId) {
        let url = `https://steamcommunity.com/market/itemordershistogram?language=english&currency=1&item_nameid=${itemId}`;
        let request = await axios.get(url).catch((err) => {
            if (err.response.status === 429) {
                Message.debug("Too many request returned from Steam");
            } else {
                Message.debug(err);
            }
        });
        if (request === undefined) {
            return null;
        }
        if (request.status === 200 && request.data.hasOwnProperty("highest_buy_order")) {
            return parseInt(request.data.highest_buy_order);
        }
        return null;
    }

    async getSteamItemId() {
        let raw = fs.readFileSync('./Data/steam.json');
        let data = JSON.parse(raw);
        let itemId = null;
        if (!data.hasOwnProperty(this.item.name)) {
            Message.debug("Item Id not found in steam JSON, searching...");
            itemId = await this.getSteamIdFromRequest();
            if (itemId) {
                Message.debug(`Item Id: ${itemId}`);
                data[this.item.name] = itemId;
                fs.writeFile("./Data/steam.json", JSON.stringify(data), 'utf8', (err) => {
                    if (err) {
                        Message.debug(err);
                    }
                    Message.debug(`Item ID ${itemId} saved to JSON`);
                });
            }
        } else {
            itemId = data[this.item.name];
        }
        return itemId;
    }

    async getSteamIdFromRequest() {
        let url = `https://steamcommunity.com/market/listings/730/${encodeURI(this.item.name)}`;
        let request = await axios.get(url).catch((err) => {
            Message.debug(err);
        });
        let html = "";
        if (request.status === 200) {
            html = request.data;
        }
        let match = html.match(/Market_LoadOrderSpread\(([\s\d]*)\);/is);
        return match[1].trim();
    }
}