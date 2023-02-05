const wear = require("../Item/Wear.js");
const config = require("../config.json");
const blacklist = require("../blacklist.json");
const _ = require("underscore");

module.exports = class Item {
    constructor(item) {
        this.raw = item;
        this.depositId = item.id;
        this.wear = item.wear;
        this.wear_name = wear.getWear(this.wear);
        this.name = item.market_name;
        this.raw_value = item.market_value;
        this.bid_value = item.market_value;
        this.value = this.getValue();
        this.price = this.getPrice();
        this.is_commodity = item.is_commodity;
    }

    hasGoodFloat() {
        if (this.wear === undefined) {
            return false;
        }

        return this.wear <= wear.getGoodWear(this.wear_name);
    }

    isStatTrack() {
        return (this.name.indexOf("StatTrak™") !== -1);
    }

    isKnifeorGlove() {
        return (this.name.indexOf('★') !== -1);
    }

    getValue() {
        return this.raw_value/100;
    }

    getPrice() {
        return this.getValue() * config.empire.coin_value;
    }

    getBidValue() {
        return this.bid_value/100;
    }

    getBidPrice() {
        return this.getBidValue() * config.empire.coin_value;
    }

    getFormattedPrice() {
        return "$" + this.getPrice().toFixed(2);
    }

    getFormattedBidPrice() {
        return "$" + this.getBidPrice().toFixed(2);
    }

    isOnBlackList() {
        if (blacklist.hasOwnProperty("market_name") && _.isArray(blacklist.market_name)) {
            let blacklisted = _.find(blacklist.market_name, (name) => {
                return this.name.indexOf(name) !== -1;
            });
            return (blacklisted !== undefined)
        }
        return false;
    }
}