const wear = require("../Item/Wear.js");
const config = require("../config.json");

module.exports = class Item {
    constructor(item) {
        this.raw = item;
        this.wear = item.wear;
        this.wear_name = wear.getWear(this.wear);
        this.name = item.market_name;
        this.raw_value = item.market_value;
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

    getFormatedPrice() {
        return "$" + this.getPrice().toFixed(2);
    }
}