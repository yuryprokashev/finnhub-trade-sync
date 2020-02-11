#!/usr/bin/env node
const TradeLoaderBuilderFactoryConstructor = require('./TradeLoaderBuilderFactory');
const ObjectBufferBuilderFactoryConstructor = require("./ObjectBufferBuilderFactory");
const SendTradesToGoogleScriptWebApiFactoryConstructor = require("./SendTradesToGoogleScriptWebApi");
const ErrorAppBuilderFactoryConstructor = require("./ErrorAppBuilderFactory");
const fs = require("fs");

let tradeSyncConfig = JSON.parse(fs.readFileSync("../finnhub-trade-sync-config.json", {encoding: "UTF-8"}));
var errorApp = new ErrorAppBuilderFactoryConstructor().getBuilder().setHttpEndpoint(tradeSyncConfig.egress.url).build();
let finnhubToken = fs.readFileSync("../finnhub-token", {encoding: "UTF-8"});
let objectBuffer = new ObjectBufferBuilderFactoryConstructor().getBuilder().build();
let sendTrades = new SendTradesToGoogleScriptWebApiFactoryConstructor().getBuilder()
    .setObjectBuffer(objectBuffer)
    .setEgressUrl(tradeSyncConfig.egress.googleAppWebApi)
    .setBufferSize(tradeSyncConfig.egress.tradesBufferSize)
    .setErrorApp(errorApp)
    .build();

var tradeLoaderBuilder = new TradeLoaderBuilderFactoryConstructor().getBuilder().setFinnhubToken(finnhubToken).setErrorApp(errorApp);
tradeSyncConfig.ingress.subscriptions.split("|").forEach(function (symbol) {
    tradeLoaderBuilder.addSymbol(symbol);
});

(async function main(){
    try {
        tradeLoaderBuilder.addAction(sendTrades.execute).build().execute();
    } catch (e) {
        await errorApp.save(e);
    }
})();