const TradeLoaderBuilderFactoryConstructor = require('./TradeLoaderBuilderFactory');
const ObjectBufferBuilderFactoryConstructor = require("./ObjectBufferBuilderFactory");
const SendTradesToGoogleScriptWebApiFactoryConstructor = require("./SendTradesToGoogleScriptWebApi");
const fs = require("fs");

let finnhubToken = fs.readFileSync("finnhub-token", {encoding: "UTF-8"});
let tradeSyncConfig = JSON.parse(fs.readFileSync("finnhub-trade-sync-config.json", {encoding: "UTF-8"}));
let objectBuffer = new ObjectBufferBuilderFactoryConstructor().getBuilder().build();
let sendTrades = new SendTradesToGoogleScriptWebApiFactoryConstructor().getBuilder()
    .setObjectBuffer(objectBuffer)
    .setEgressUrl(tradeSyncConfig.egress.googleAppWebApi)
    .setBufferSize(tradeSyncConfig.egress.tradesBufferSize)
    .build();

var tradeLoaderBuilder = new TradeLoaderBuilderFactoryConstructor().getBuilder().setFinnhubToken(finnhubToken);
tradeSyncConfig.ingress.subscriptions.split("|").forEach(function (symbol) {
    tradeLoaderBuilder.addSymbol(symbol);
});
tradeLoaderBuilder.addAction(sendTrades.execute).build().execute();