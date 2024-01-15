const secret = require('./secret.json')
const crypto = require('crypto')
const axios = require("axios");
const moment = require('moment');
const DOMAIN = 'https://www.tokocrypto.com'
const APIKEY = secret.APIKEY
const SECRETKEY = secret.SECRETKEY

const OrderType = {
    LIMIT: 1,
    MARKET: 2,
    STOP_LOSS: 3,
    STOP_LOSS_LIMIT: 4,
    TAKE_PROFIT: 5,
    TAKE_PROFIT_LIMIT: 6,
    LIMIT_MAKER: 7
}

const OrderSide = {
    BUY: 0,
    SELL: 1
}
class Tokocrypto {

    getSignature(queryString) {

        const signature = crypto
            .createHmac(`sha256`, SECRETKEY)
            .update(queryString)
            .digest(`hex`);

        return signature
    }

    generateQueryString(params){
        let a = Object.keys(params).map(key => key + '=' + params[key]).join('&');
        return a
    }

    async requestPrivate(endpoint, param, method, domain){

        try {
            param.recvWindow = 5000
            param.timestamp = moment().valueOf()

            
            let URL = (domain)? `${domain}${endpoint}`: `${DOMAIN}${endpoint}`
            let config = {
                headers: {
                    'X-MBX-APIKEY': APIKEY
                }
            };
            param.signature = this.getSignature(this.generateQueryString(param))
            config.params = param

            let result = null
            if (method === "get"){
                result =  await axios.get(URL, config)
            }else if (method === "post"){
                result =  await axios.post(URL, null, config)
            }

            return (result)? result.data: result

        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async requestPublic(endpoint, params, domain){
        try {

            let URL = (domain)? `${domain}${endpoint}`: `${DOMAIN}${endpoint}`
            let config = {
                params
            };
            let result =  await axios.get(URL, config)
            return result.data
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async createorder(side, quantity, pairs, type){
        try {
            let response = await this.requestPrivate('/open/v1/orders', {
                symbol: pairs,
                side: side, 
                type: type,
                quantity: quantity
            }, 'post')
            return response
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async userDataStream(){
        try {
            let response = await this.requestPrivate('/open/v1/user-data-stream', {}, 'post')
            return response
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async cancelOrder(order_id){
        try {
            let response = await this.requestPrivate('/open/v1/orders/cancel', {
                order_id
            }, 'post')
            return response
        } catch (error) {
            console.log(error)
            // throw error
            return error
        }
    }

    async queryOrder(order_id){
        try {
            let response = await this.requestPrivate('/open/v1/orders/detail', {
                orderId: order_id
            }, 'get')
            return response
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async asset(asset){
        try {
            let response = await this.requestPrivate('/open/v1/account/spot/asset', {
                asset: asset.toUpperCase()
            }, 'get')
            return response
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async accountTradeList(symbol){
        try {
            let response = await this.requestPrivate('/open/v1/orders/trades', {
                symbol: symbol.toUpperCase()
            }, 'get')
            return response
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async accountInformation(){
        try {
            let response = await this.requestPrivate('/open/v1/account/spot', {
                
            }, 'get')
            return JSON.stringify(response)
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async allOrders(symbol){
        ///open/v1/orders
        try {
            let response = await this.requestPrivate('/open/v1/orders', {
                symbol: symbol.toUpperCase()
            }, 'get')
            return response
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async depositAddress(asset, network){

        try {
            let response = await this.requestPrivate('/open/v1/deposits/address', {
                asset: asset.toUpperCase(),
                network
            }, 'get')
            return response
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async depositHistory(body = "all"){

        try {
            let param =  (typeof body ==  "string" && body.toLowerCase() == "all")? {}: {
                asset: body.asset, status: body.status, fromId: body.fromId,
                startTime: body.startTime,
                endTime: body.endTime
            }
            let response = await this.requestPrivate('/open/v1/deposits', param, 'get')
            return response
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async withdrawHistory(body = "all"){

        try {
            let param = (typeof body ==  "string" && body.toLowerCase() == "all")? {}: {
                asset: body.asset, status: body.status, fromId: body.fromId,
                startTime: body.startTime,
                endTime: body.endTime
            }
            let response = await this.requestPrivate('/open/v1/withdraws', param, 'get')
            return response
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async orderbook(symbol){
        try {
            let response = await this.requestPublic('/open/v1/market/depth', {
                symbol: symbol.toUpperCase()
            })
            return response
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async tradingSymbol(){
        ///open/v1/common/symbols
        try {
            let response = await this.requestPublic('/open/v1/common/symbols', { 
            })
            return response
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async serverTime(){
        ///open/v1/common/time
        try {
            let response = await this.requestPublic('/open/v1/common/time', { 
            })
            return response
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async klines(symbol, interval, startTime, endTime, limit){
        try {
            let param = { 
                symbol: symbol.replace("_",""),
                interval: interval,
                startTime: startTime,
                endTime: endTime,
                limit: (limit)? limit: 1000
            }
            let response = await this.requestPublic('/api/v1/klines', param ,'https://api.binance.me')
            return response
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async recentTradeList(symbol, fromId, limit){
        try {
            let response = await this.requestPublic('/api/v3/trades', { 
                symbol: symbol.replace("_",""),
                fromId,
                limit: (limit)? limit: 1000
            },'https://api.binance.me')
            return response
        } catch (error) {
            console.log(error)
            throw error
        }
    }

}

module.exports = new Tokocrypto()

async function main(){
    // public request
    // let result = await module.exports.orderbook("usdt_bidr")
    // let result = await module.exports.serverTime()

    // private Request
    let result = await module.exports.asset("bnb")
    // let result = await module.exports.queryOrder("1")
    // let result = await module.exports.accountTradeList("BNB")
    // let result = await module.exports.accountInformation()
    // let result = await module.exports.createorder(OrderSide.SELL, 1.5, "USDT_BIDR", OrderType.MARKET)
    // let result = await module.exports.allOrders("USDT")
    // let result = await module.exports.withdrawHistory()
    // let result = await module.exports.userDataStream()
    // let result = await module.exports.depositHistory()
    console.log(JSON.stringify(result))
}

main()